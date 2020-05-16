import SimplePeer from 'simple-peer';
import { Emitter } from './emitter';

let ctr = 1;

export default class WebRTCPeer extends Emitter {
  static isSupported() {
    return SimplePeer.WEBRTC_SUPPORT;
  }

  constructor({ remote, local, ...opt } = {}) {
    super();

    this.remote = remote;
    this.local = local;
    this.initiator = opt.initiator;
    // eslint-disable-next-line no-plusplus
    this.id = `webrtc-peer${ctr++}`;

    console.log('peer', this.id);
    this.setupPeer(opt);
  }

  setupPeer(opt) {
    this.error = null;
    this.active = false;
    this.stream = null;

    const opts = {
      ...opt,
      // Allow the peer to receive video, even if it's not sending stream:
      // https://github.com/feross/simple-peer/issues/95
      offerConstraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      },
    };

    console.log('SimplePeer opts:', opts);

    // https://github.com/feross/simple-peer/blob/master/README.md
    this.peer = new SimplePeer(opts);

    this.peer.on('close', () => this.close());

    // We receive a connection error
    this.peer.on('error', (err) => {
      console.log(`${this.id} | error`, err);
      this.error = err;
      this.emit('error', err);
      this.close();
      setTimeout(() => {
        this.setupPeer(opt); // ???
      }, 1000);
    });

    // This means, we received network details (signal) we need to provide
    // the remote peer, so he can set up a connection to us. Usually we will
    // send this over a separate channel like the web socket signaling server
    this.peer.on('signal', (data) => {
      // log(`${this.id} | signal`, this.initiator)
      this.emit('signal', data);
    });

    // We received data from the peer
    this.peer.on('data', (data) => {
      console.log(`${this.id} | data`, data);
      this.emit('data', data);
      this.emit('message', { data }); // Channel compat
    });

    // Connection succeeded
    this.peer.on('connect', (event) => {
      console.log(`${this.id} | connect`, event);
      this.active = true;
      // p.send('whatever' + Math.random())
      this.emit('connect', event);
    });

    this.peer.on('stream', (stream) => {
      console.log('new stream', stream);
      this.stream = stream;
      this.emit('stream', stream);
    });
  }

  setStream(stream) {
    if (!this.peer.streams.includes(stream)) {
      try {
        this.peer.streams.forEach((s) => this.peer.removeStream(s));
      } catch (err) {
        console.error('Exception setStream remove:', err);
      }
      if (stream) {
        // assert(stream, 'Expected a stream');
        this.peer.addStream(stream);
      }
    }
  }

  // We got a signal from the remote peer and will use it now to establish the connection
  signal(data) {
    if (this.peer && !this.peer.destroyed) {
      this.peer.signal(data);
    } else {
      console.log('Tried to set signal on destroyed peer', this.peer, data);
    }
  }

  postMessage(data) { // Channel compat
    this.peer.send(data);
  }

  close() {
    this.emit('close');
    this.active = false;
    if (this.peer) this.peer.destroy();
  }
}
