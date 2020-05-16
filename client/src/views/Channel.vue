<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col justify-center items-center">
      <div>Channel <span class="font-bold">{{ $route.params.id }}</span></div>

      <v-video
        v-for="peer in state.status"
        :key="peer.remote"
        :stream="peer.peer.stream"
      />

      <button
        class="bg-red-600 text-white rounded px-4 h-8 mb-8"
        @click="$router.push({ name: 'Home' })"
      >
        Exit
      </button>

      <div>
        <!-- <div class="font-bold">Online</div>
        <div v-for="peer in peers" :key="peer.id">{{ peer }}</div> -->
      </div>
    </div>
  </div>
</template>

<script>
import VVideo from '@/components/Video.vue';
// import { messages } from '../emitter';
import { setup } from '../state';
// import io from 'socket.io-client';

export default {
  name: 'Channel',
  data: () => ({
    conn: null,
  }),
  created() {
    // const { id } = this.$route.params;
    // const socket = io('http://localhost:3000');
    // this.socket = socket;

    // socket.on('connect', () => {
    //   this.peerId = socket.id;
    //   console.log('[socket.io]: connected.');
    //   socket.emit('join', id);
    // });

    // socket.on('sync', ({ peers }) => {
    // this.peers = peers.map((p) => ({ id: p, rtc: new RTCPeerConnection(peerConnectionConfig) }));
    //   console.log('[socket.io]: synced.');
    // });

    // socket.on('joined', ({ socketId }) => {
    //   console.log(socketId, ' joined.');
    //   const peer = { id: socketId, rtc: new RTCPeerConnection(peerConnectionConfig) };
    //   this.peers.push(peer);

    //   peer.rtc.onicecandidate = (event) => {
    //     if (event.candidate) {
    //       socket.emit('signal', {
    //         from: socketId,
    //         room: this.$route.params.id,
    //         candidate: event.candidate,
    //       });
    //     }
    //   };

    //   // Create an offer to connect with your local description
    //   if (this.peers.length >= 2) {
    //     console.log('Creating an offer to last user joined.', peer.id);
    //     peer.rtc.createOffer().then((description) => {
    //       peer.rtc.setLocalDescription(description).then(() => {
    //         socket.emit('signal', {
    //           from: peer.id,
    //           room: this.$route.params.id,
    //           sdp: peer.rtc.localDescription,
    //         });
    //       }).catch((e) => console.error(e));
    //     });
    //   }

    //   // Wait for their video stream
    //   // peer.rtc.ontrack = (event) => {
    //   //   gotRemoteStream(event, socketListId);
    //   // };

    //   // Add the local video stream
    //   // this.stream.getTracks().forEach((track) => {
    //   //  peer.rtc.addTrack(track, this.stream);
    //   // });
    // });

    // socket.on('signal', (signal) => {
    //   if (signal.candidate) {
    //     this.peers.forEach((peer) => {
    //       if (peer.id === signal.from) {
    //         peer.addIceCandidate(new RTCIceCandidate(signal.ice))
    //           .catch((e) => console.error(e));
    //       }
    //     });
    //   }
    //   if (signal.sdp) {
    //     const peer = this.peers.find((p) => p.id === signal.from);
    //     console.log('Should make an answer to this peer: ', peer.id);
    //     peer.rtc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
    //       .then(() => {
    //         if (signal.sdp.type === 'offer') {
    //           peer.rtc.createAnswer().then((description) => {
    //             peer.rtc.setLocalDescription(description).then(() => {
    //               socket.emit('signal', {
    //                 from: peer.id,
    //                 room: this.$route.params.id,
    //                 sdp: peer.rtc.localDescription,
    //               });
    //             }).catch((e) => console.error(e));
    //           }).catch((e) => console.error(e));
    //         }
    //       }).catch((e) => console.error(e));
    //   }
    // });

    // socket.on('left', ({ socketId }) => {
    //   console.log(socketId, ' left.');
    //   this.peers = this.peers.filter((p) => p.id !== socketId);
    // });
  },
  async mounted() {
    this.conn = await setup();
  },
  beforeDestroy() {
    // this.socket.emit('leave', { room: this.$route.params.id });
    if (this.conn) {
      this.conn.cleanup();
    }
  },
  components: { VVideo },
};
</script>
