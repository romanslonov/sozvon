import io from 'socket.io-client';
import { SIGNAL_SERVER_URL } from './config';
import { Emitter } from './emitter';
import WebRTCPeer from './WebRTCPeer';

// Handles multiple connections, one to each peer
export default class WebRTC extends Emitter {
  peerConnections = {}

  peerSettings = {}

  static isSupported() {
    return WebRTCPeer.isSupported();
  }

  constructor({
    wrtc, // wrtc is used for unit testing via node.js
    room = null,
    peerSettings = {},
  } = {}) {
    super();
    if (!room) console.log('room cannot be empty');

    this.peerSettings = peerSettings;

    console.log('webrtc reaches out to', SIGNAL_SERVER_URL);

    this.io = io(SIGNAL_SERVER_URL, {
      // transports: ['websocket'],
    });

    this.io.on('connect', () => {
      console.log('connect', this.io.id);
      this.emit('io', {
        online: true,
      });
      this.emit('connect');
      this.io.emit('join', { room });
    });

    this.io.on('disconnect', () => {
      console.log('disconnect');
      this.emit('io', {
        online: false,
      });
      this.emit('disconnect');
    });

    this.io.on('remove', ({ id }) => {
      const peer = this.peerConnections[id];
      if (peer) {
        peer.close();
        delete this.peerConnections[id];
        this.updateStatus();
        this.emit('disconnected', { peer });
      }
    });

    // Receive all other currently available peers
    this.io.on('joined', ({ _room, peers }) => {
      const local = this.io.id;
      console.log('me', local, _room, 'peers', peers);

      // We will try to establish a separate connection to all of them
      // If the new participant (us) initiates the connections, the others do
      // not need to get updates about new peers
      this.io.on('signal', ({
        from, signal,
      }) => {
        // log('received signal', from, to === local, initiator)
        // If we are not already connected, do it now
        let peer = this.peerConnections[from];
        if (!peer) {
          peer = this.handlePeer({
            remote: from,
            local,
            initiator: false,
            wrtc,
          });
        }
        peer.signal(signal);
        this.updateStatus();
      });

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < peers.length; i++) {
        const remote = peers[i];
        this.handlePeer({
          remote,
          local,
          initiator: true,
          wrtc,
        });
      }

      this.updateStatus();
    });
  }

  forEachPeer(fn) {
    Object.values(this.peerConnections).forEach(fn);
  }

  updateStatus() {
    const status = Object.values(this.peerConnections).map((peer) => {
      const {
        active, initiator, local, remote, error,
      } = peer;
      return {
        active, initiator, local, remote, error, peer,
      };
    });
    this.emit('status', { status });
  }

  getPeer(id) {
    return this.peerConnections[id] || null;
  }

  handlePeer({
    remote, wrtc, local, initiator = false,
  } = {}) {
    const peer = new WebRTCPeer({
      local,
      remote,
      initiator,
      wrtc,
      ...this.peerSettings,
    });

    this.peerConnections[remote] = peer;

    // We received the local signal (i.e. network location description) that
    // we will now send via web socket signaling server to the remote peer
    peer.on('signal', (signal) => {
      // log('received peer signal', remote)
      this.io.emit('signal', {
        from: local,
        to: remote,
        signal,
        initiator,
      });
    });

    // The full connection is established, from now on we can exchange data
    peer.on('connect', () => {
      this.emit('connected', { peer });
      this.updateStatus();
    });

    // A message from the remote peer
    peer.on('data', (data) => { // depr
      const { type, ...msg } = JSON.parse(data);
      this.emit(type, msg);
    });

    peer.on('message', (data) => {
      this.emit('message', data); // Channel compat
    });

    peer.on('stream', () => this.updateStatus());
    peer.on('track', () => this.updateStatus());

    return peer;
  }

  postMessage(data) { // Channel compat
    this.forEachPeer((peer) => {
      peer.postMessage(data);
    });
  }

  send(type, msg = {}) { // depr
    this.postMessage(JSON.stringify({ ...msg, type }));
  }

  close() {
    this.forEachPeer((peer) => peer.close());
    this.peerConnections = {};
    this.io.close();
  }

  async cleanup() {
    // await super.cleanup()
    this.close();
  }
}
