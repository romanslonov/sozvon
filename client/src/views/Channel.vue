<template>
  <div class="flex min-h-screen bg-gray-900">
    <div class="flex items-center flex-grow min-h-screen p-8">
      <div class="flex justify-center flex-wrap w-full -m-1">
        <div class="w-full md:w-1/2 lg:w-1/3 p-1">
          <v-local-stream
            class="w-full"
            :stream="localStream"
          />
        </div>
        <div class="w-full md:w-1/2 lg:w-1/3 p-1" v-for="stream in streams" :key="stream.id">
          <v-remote-stream
            class="w-full"
            :id="stream.id"
            :stream="stream.src"
            :audioMuted="stream.audioMuted"
            :videoOff="stream.videoOff"
          />
        </div>
      </div>
      <v-panel-user :stream="localStream" />
    </div>
    <v-chat :socket="socket" />
  </div>
</template>

<script>
import VPanelUser from '@/components/UserPanel.vue';
import VRemoteStream from '@/components/stream/Remote.vue';
import VLocalStream from '@/components/stream/Local.vue';
import VChat from '@/components/Chat.vue';
// import VVideo from '@/components/Video.vue';
import { SIGNAL_SERVER_URL, ICE_CONFIG } from '@/config';
import io from 'socket.io-client';
import Timer from 'easytimer.js';
import bus from '@/bus';

export default {
  name: 'Channel',
  data: () => ({
    sid: null,
    socket: null,
    meter: null,
    localStream: null,
    rafID: null,
    peers: [],
    streams: [],
    timer: null,
    constraints: {
      video: false,
      audio: true,
    },
  }),
  async created() {
    if (!this.socket) {
      this.timer = new Timer();
      this.init();
    }
    bus.$on('local.audio.mute', this.handleAudioMute);
    bus.$on('local.video.off', this.handleVideoOff);
    bus.$on('local.video.upgrade', this.handleUpgrade);
    bus.$on('hangup', this.handleHangup);
  },
  methods: {
    async init() {
      const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      this.localStream = stream;

      this.socket = io(SIGNAL_SERVER_URL);

      this.socket.on('connect', () => {
        this.sid = this.socket.id;

        this.socket.emit('join', { room: this.$route.params.id });
        this.socket.on('joined', this.handleIncomingPeer);
        this.socket.on('signal', this.handleSignalResponse);
        this.socket.on('action', this.handlePeerAction);
        this.socket.on('leave', this.handleLeavePeer);
      });
    },
    handleLeavePeer({ sid }) {
      const peer = this.getPeer(sid);

      if (peer) {
        peer.pc.close();
      }

      this.peers = this.peers.filter((c) => c.id !== sid);
      this.streams = this.streams.filter((s) => s.id !== sid);

      if (this.peers.length === 0) {
        this.timer.stop();
      }
    },
    async handleIncomingPeer({ sid }) {
      if (this.getPeer(sid)) return;
      const peer = this.setupPeer(sid, true);
      this.peers.push(peer);

      if (this.peers.length > 0) {
        this.timer.start();
      }
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
                      this.timer.start();
                    });
                });
            });
        }
        if (signal.sdp.type === 'answer') {
          remotePeer.pc.setRemoteDescription(signal.sdp);
        }
      }

      if (signal.ice) {
        // console.log('addIceCandidate', signal.ice);
        await remotePeer.pc.addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.error(e));
      }
    },
    setupPeer(sid, initCall = false) {
      const connection = { id: sid, pc: new RTCPeerConnection(ICE_CONFIG) };
      connection.pc.onicecandidate = (event) => this.gotIceCandidate(event, sid);
      connection.pc.oniceconnectionstatechange = (event) => this.checkPeerDisconnect(event, sid);
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
      if (this.streams.filter((s) => s.id === sid).length === 0) {
        this.streams.push({
          id: sid,
          audioMuted: false,
          videoOff: false,
          src: event.streams[0],
        });
      } else {
        this.streams = this.streams.map((stream) => {
          if (stream.id === sid) {
            const s = { ...stream };
            // eslint-disable-next-line prefer-destructuring
            s.src = event.streams[0];
            return s;
          }
          return stream;
        });
      }
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
    checkPeerDisconnect(event, sid) {
      const peer = this.getPeer(sid);

      if (!peer) return;

      const state = peer.pc.iceConnectionState;
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        this.handleLeavePeer({ sid });
      }
    },
    getPeer(sid) {
      return this.peers.find((c) => c.id === sid);
    },
    handleHangup() {
      this.$router.push({ name: 'Home' }).catch(() => {});
    },
    handleAudioMute(value) {
      this.socket.emit('action', {
        type: 'audioMute',
        muted: value,
        id: this.sid,
        room: this.$route.params.id,
      });
    },
    handleVideoOff() {
      const track = this.localStream.getVideoTracks()[0];
      track.enabled = !track.enabled;
      this.socket.emit('action', {
        type: 'videoOff',
        muted: track.enabled,
        id: this.sid,
        room: this.$route.params.id,
      });
    },
    handlePeerAction(data) {
      if (data.type === 'audioMute') {
        this.streams = this.streams.map((stream) => {
          if (stream.id === data.id) {
            const s = { ...stream };
            s.audioMuted = !s.audioMuted;
            return s;
          }
          return stream;
        });
      }
      if (data.type === 'videoOff') {
        this.streams = this.streams.map((stream) => {
          if (stream.id === data.id) {
            const s = { ...stream };
            s.videoOff = !s.videoOff;
            return s;
          }
          return stream;
        });
      }
    },
    async handleUpgrade() {
      const stream = await navigator.mediaDevices.getUserMedia({
        ...this.constraints,
        video: true,
      });
      this.localStream = stream;

      this.peers.forEach((peer) => {
        this.localStream
          .getTracks()
          .forEach((track) => peer.pc.addTrack(track, this.localStream));
        peer.pc.createOffer()
          .then((description) => {
            peer.pc.setLocalDescription(description)
              .then(() => {
                this.socket.emit('signal', {
                  to: peer.id,
                  from: this.sid,
                  sdp: peer.pc.localDescription,
                });
              });
          });
      });
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.localStream.getTracks().forEach((track) => {
      track.stop();
    });
  },
  components: {
    VPanelUser,
    VRemoteStream,
    VLocalStream,
    VChat,
  },
};
</script>
