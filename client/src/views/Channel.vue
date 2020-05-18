<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex flex-col bg-gray-200 border-b py-8">

      <div class="flex flex-col items-center">
        <div>Channel <span class="font-bold">{{ $route.params.id }}</span></div>
      </div>

      <v-video
        muted
        local
        mirrored
        v-if="localStream"
        :stream="localStream"
        @hangup="handleHangup"
      />

    </div>
    <div class="flex py-4">
      <v-video
        v-for="(stream, i) in streams"
        :key="i"
        :stream="stream.src"
      />
    </div>
  </div>
</template>

<script>
import VVideo from '@/components/Video.vue';
import { SIGNAL_SERVER_URL, PEER_CONFIG } from '@/config';
import io from 'socket.io-client';

const constraints = {
  video: true,
  audio: true,
};

export default {
  name: 'Channel',
  data: () => ({
    sid: null,
    socket: null,
    localStream: null,
    peers: [],
    streams: [],
  }),
  async created() {
    if (!this.socket) {
      this.init();
    }
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
        this.socket.on('leave', this.handleLeavePeer);
      });
    },
    handleLeavePeer({ sid }) {
      this.peers = this.peers.filter((c) => c.id !== sid);
      this.streams = this.streams.filter((s) => s.id !== sid);
    },
    async handleIncomingPeer({ sid }) {
      if (this.getPeer(sid)) return;
      const peer = this.setupPeer(sid, true);
      this.peers.push(peer);
    },
    async handleSignalResponse(signal) {
      if (!this.getPeer(signal.from)) {
        const peer = this.setupPeer(signal.from);
        this.peers.push(peer);
      }

      const remotePeer = this.getPeer(signal.from);

      if (signal.sdp) {
        if (signal.sdp.type === 'offer') {
          remotePeer.pc.setRemoteDescription(signal.sdp)
            .then(() => {
              remotePeer.pc.createAnswer()
                .then((description) => {
                  remotePeer.pc.setLocalDescription(description)
                    .then(() => {
                      this.socket.emit('signal', {
                        to: signal.from,
                        from: this.sid,
                        sdp: remotePeer.pc.localDescription,
                      });
                    });
                });
            });
        }
        if (signal.sdp.type === 'answer') {
          remotePeer.pc.setRemoteDescription(signal.sdp);
        }
      }

      if (signal.ice) {
        await remotePeer.pc.addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.error(e));
      }
    },
    setupPeer(sid, initCall = false) {
      const connection = { id: sid, pc: new RTCPeerConnection(PEER_CONFIG) };
      connection.pc.onicecandidate = (event) => this.gotIceCandidate(event, sid);
      connection.pc.ontrack = (event) => this.gotRemoteStream(event, sid);
      this.localStream
        .getTracks()
        .forEach((track) => connection.pc.addTrack(track, this.localStream));

      if (initCall) {
        connection.pc.createOffer()
          .then((description) => {
            connection.pc.setLocalDescription(description)
              .then(() => {
                this.socket.emit('signal', {
                  to: sid,
                  from: this.sid,
                  sdp: connection.pc.localDescription,
                });
              });
          });
      }

      return connection;
    },
    gotRemoteStream(event, sid) {
      if (this.streams.some((s) => s.id === sid)) return;
      this.streams.push({
        id: sid,
        src: event.streams[0],
      });
    },
    gotIceCandidate(event, sid) {
      if (event.candidate) {
        this.socket.emit('signal', {
          to: sid,
          from: this.sid,
          ice: event.candidate,
        });
      }
    },
    getPeer(sid) {
      return this.peers.find((c) => c.id === sid);
    },
    handleHangup() {
      this.$router.push({ name: 'Home' }).catch(() => {});
    },
  },
  beforeDestroy() {
    this.socket.close();
    this.socket = null;
    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });
  },
  components: { VVideo },
};
</script>
