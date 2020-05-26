<template>
  <div class="flex min-h-screen bg-gray-900">
    <div class="flex items-center flex-grow min-h-screen p-8">
      <div class="flex justify-center flex-wrap w-full -m-1">
        <div class="w-full md:w-1/2 lg:w-1/3 p-1">
          <v-local-stream
            class="w-full"
            :stream="state.stream"
          />
        </div>
        <div class="w-full md:w-1/2 lg:w-1/3 p-1" v-for="peer in state.status" :key="peer.remote">
          <v-remote-stream
            class="w-full"
            :id="peer.remote"
            :stream="peer.peer.stream"
          />
        </div>
      </div>
      <v-panel-user @hangup="hangup" @muteAudio="muteAudio" />
    </div>
    <!-- <v-chat :socket="socket" /> -->
  </div>
</template>

<script>
import { setup } from '@/state';
import { messages } from '@/emitter';
import VPanelUser from '@/components/UserPanel.vue';
import VRemoteStream from '@/components/stream/Remote.vue';
import VLocalStream from '@/components/stream/Local.vue';
// import VChat from '@/components/Chat.vue';
// import { SIGNAL_SERVER_URL, ICE_CONFIG } from '@/config';
// import io from 'socket.io-client';
// import bus from '@/bus';
// import SimplePeer from 'simple-peer';

// const { log } = window.console;

export default {
  name: 'Channel',
  data: () => ({
    conn: null,
  }),
  methods: {
    muteAudio() {
      this.state.muteAudio = !this.state.muteAudio;
      messages.emit('updateStream');
    },
    hangup() {
      this.$router.push('/').catch(() => {});
    },
  },
  async mounted() {
    this.conn = await setup();
  },
  beforeDestroy() {
    if (this.conn) {
      this.conn.cleanup();
    }
  },
  components: {
    VPanelUser,
    VRemoteStream,
    VLocalStream,
    // VChat,
  },
};
</script>
