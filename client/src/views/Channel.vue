<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="p-8">
      <div>
        <v-video
          local
          v-if="localStream"
          :stream="localStream"
        />

        <!-- <div class="flex flex-col w-56 border-2 rounded p-2 ml-4">
          <div class="flex-grow"></div>
          <textarea class="border rounded w-full" id=""></textarea>
        </div> -->
      </div>
      <div class="flex pt-4">
        <v-video
          class="m-0"
          v-for="(stream, i) in streams"
          :key="i"
          :stream="stream.src"
          width="148"
        />
      </div>
    </div>
  </div>
</template>

<script>
import VVideo from '@/components/Video.vue';
import { SIGNAL_SERVER_URL, ICE_CONFIG } from '@/config';
import io from 'socket.io-client';
import Timer from 'easytimer.js';
import SimplePeer from 'simple-peer';

const constraints = {
  video: false,
  audio: true,
};

export default {
  name: 'Channel',
  data: () => ({
    timer: null,
    localStream: null,

    peers: [],
    streams: [],
  }),
  created() {
    if (!this.socket) {
      this.timer = new Timer();
      this.init();
    }
  },
  beforeDestroy() {
    this.socket.close();
    this.socket = null;
    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });
  },
  methods: {
    async init() {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;

      this.socket = io(SIGNAL_SERVER_URL);

      this.socket.on('connect', () => {
        this.sid = this.socket.id;

        this.socket.emit('join', { room: this.$route.params.id });
        this.socket.on('joined', this.handleIncomingPeer);
        this.socket.on('signal', this.handleSignalResponse);
        // this.socket.on('action', this.handlePeerAction);
        this.socket.on('leave', this.handleLeavePeer);
      });
    },
    handleIncomingPeer({ sid }) {
      if (this.getPeer(sid)) return;

      const peer = this.setupPeer(sid, true);

      this.peers.push({
        id: sid,
        pc: peer,
      });
    },
    async handleSignalResponse(signal) {
      if (signal.type === 'offer') {
        if (!this.getPeer(signal.from)) {
          const peer = this.setupPeer(signal.from, false, signal.data);

          this.peers.push({ id: signal.from, pc: peer });
        }
      }

      if (signal.type === 'answer') {
        const peer = this.getPeer(signal.from);
        if (peer) {
          peer.pc.signal(signal.data);
        }
      }
    },
    handleLeavePeer({ sid }) {
      this.peers = this.peers.filter((c) => c.id !== sid);
      this.streams = this.streams.filter((s) => s.id !== sid);
    },
    setupPeer(sid, initiator, signal) {
      const peer = new SimplePeer({
        trickle: true,
        initiator,
        stream: this.localStream,
        config: ICE_CONFIG,
      });

      if (!initiator) {
        peer.signal(signal);
      }

      peer.on('signal', (data) => {
        this.socket.emit('signal', {
          type: initiator ? 'offer' : 'answer',
          to: sid,
          from: this.sid,
          data,
        });
      });

      peer.on('stream', (stream) => {
        this.gotStream(stream, sid);
      });

      return peer;
    },
    gotStream(stream, sid) {
      this.streams.push({ id: sid, src: stream });
    },
    getPeer(sid) {
      return this.peers.find((c) => c.id === sid);
    },
  },
  // data: () => ({
  //   sid: null,
  //   socket: null,
  //   meter: null,
  //   localStream: null,
  //   rafID: null,
  //   peers: [],
  //   streams: [],
  //   timer: null,
  // }),
  // async created() {
  // if (!this.socket) {
  //   this.timer = new Timer();
  //   this.init();
  // }
  // },
  // methods: {
  //   async init() {
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     this.localStream = stream;

  //     this.socket = io(SIGNAL_SERVER_URL);

  //     this.socket.on('connect', () => {
  //       this.sid = this.socket.id;

  //       this.socket.emit('join', { room: this.$route.params.id });
  //       this.socket.on('joined', this.handleIncomingPeer);
  //       this.socket.on('signal', this.handleSignalResponse);
  //       this.socket.on('action', this.handlePeerAction);
  //       this.socket.on('leave', this.handleLeavePeer);
  //     });
  //   },
  //   handleLeavePeer({ sid }) {
  //     this.peers = this.peers.filter((c) => c.id !== sid);
  //     this.streams = this.streams.filter((s) => s.id !== sid);
  //     if (this.peers.length === 0) {
  //       this.timer.stop();
  //     }
  //   },
  //   async handleIncomingPeer({ sid }) {
  //     if (this.getPeer(sid)) return;
  //     const peer = this.setupPeer(sid, true);
  //     this.peers.push(peer);

  //     if (this.peers.length > 0) {
  //       this.timer.start();
  //     }
  //   },
  //   async handleSignalResponse(signal) {
  //     if (!this.getPeer(signal.from)) {
  //       const peer = this.setupPeer(signal.from);
  //       this.peers.push(peer);
  //     }

  //     const remotePeer = this.getPeer(signal.from);

  //     if (signal.sdp) {
  //       if (signal.sdp.type === 'offer') {
  //         remotePeer.pc.setRemoteDescription(signal.sdp)
  //           .then(() => {
  //             remotePeer.pc.createAnswer()
  //               .then((description) => {
  //                 remotePeer.pc.setLocalDescription(description)
  //                   .then(() => {
  //                     this.socket.emit('signal', {
  //                       to: signal.from,
  //                       from: this.sid,
  //                       sdp: remotePeer.pc.localDescription,
  //                     });
  //                     this.timer.start();
  //                   });
  //               });
  //           });
  //       }
  //       if (signal.sdp.type === 'answer') {
  //         remotePeer.pc.setRemoteDescription(signal.sdp);
  //       }
  //     }

  //     if (signal.ice) {
  //       await remotePeer.pc.addIceCandidate(new RTCIceCandidate(signal.ice))
  //         .catch((e) => console.error(e));
  //     }
  //   },
  //   setupPeer(sid, initCall = false) {
  //     const connection = { id: sid, pc: new RTCPeerConnection(PEER_CONFIG) };
  //     connection.pc.onicecandidate = (event) => this.gotIceCandidate(event, sid);
  //     connection.pc.oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, sid);
  //     connection.pc.ontrack = (event) => this.gotRemoteStream(event, sid);
  //     this.localStream
  //       .getTracks()
  //       .forEach((track) => connection.pc.addTrack(track, this.localStream));

  //     if (initCall) {
  //       connection.pc.createOffer()
  //         .then((description) => {
  //           connection.pc.setLocalDescription(description)
  //             .then(() => {
  //               this.socket.emit('signal', {
  //                 to: sid,
  //                 from: this.sid,
  //                 sdp: connection.pc.localDescription,
  //               });
  //             });
  //         });
  //     }

  //     return connection;
  //   },
  //   gotRemoteStream(event, sid) {
  //     if (this.streams.some((s) => s.id === sid)) return;
  //     this.streams.push({
  //       id: sid,
  //       muted: false,
  //       src: event.streams[0],
  //     });
  //   },
  //   gotIceCandidate(event, sid) {
  //     if (event.candidate) {
  //       this.socket.emit('signal', {
  //         to: sid,
  //         from: this.sid,
  //         ice: event.candidate,
  //       });
  //     }
  //   },
  //   checkPeerDisconnect(event, sid) {
  //     const peer = this.getPeer(sid);

  //     if (!peer) return;

  //     const state = peer.pc.iceConnectionState;
  //     if (state === 'failed' || state === 'closed' || state === 'disconnected') {
  //       this.handleLeavePeer({ sid });
  //     }
  //   },
  //   getPeer(sid) {
  //     return this.peers.find((c) => c.id === sid);
  //   },
  //   handleHangup() {
  //     this.$router.push({ name: 'Home' }).catch(() => {});
  //   },
  //   handleMute(value) {
  //     this.socket.emit('action', {
  //       type: 'mute',
  //       muted: value,
  //       id: this.sid,
  //       room: this.$route.params.id,
  //     });
  //   },
  //   handlePeerAction(data) {
  //     if (data.type === 'mute') {
  //       this.streams = this.streams.map((stream) => {
  //         if (stream.id === data.id) {
  //           const s = { ...stream };
  //           s.muted = data.muted;
  //           return s;
  //         }
  //         return stream;
  //       });
  //     }
  //   },
  // },
  // beforeDestroy() {
  //   this.socket.close();
  //   this.socket = null;
  //   this.localStream.getTracks().forEach((track) => {
  //     track.stop();
  //   });
  // },
  components: { VVideo },
};
</script>
