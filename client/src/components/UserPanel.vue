<template>
  <div
    v-if="stream"
    class="fixed bottom-0 left-0 right-0 flex items-center justify-between mr-64 pb-4"
  >
    <div></div>
    <div class="flex items-center space-x-4">
      <button
        @click="toggleTrack(stream, 'audio')"
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          bg-white
          shadow
          focus:outline-none
        "
      >
        <v-mic-muted-icon
          v-if="audio.muted"
          width="24"
          height="24"
          class="text-black -mb-1"
        />
        <v-mic-icon v-else width="24" height="24" class="text-black -mb-1" />
      </button>
      <button
        @click="toggleTrack(stream, 'video')"
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          bg-white
          shadow
          focus:outline-none
        "
      >
        <v-videocam-off-icon
          v-if="video.off"
          width="24"
          height="24"
          class="text-black"
        />
        <v-videocam-icon
          v-else
          width="24"
          height="24"
          class="text-black"
        />
      </button>
      <button
        @click="handleHangup"
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          bg-red-600
          shadow
          focus:outline-none
        "
      >
        <v-call-end-icon width="24" height="24" class="text-white" />
      </button>
    </div>
    <div></div>
  </div>
</template>

<script>
import VMicMutedIcon from '@/components/icons/MicMuted.vue';
import VMicIcon from '@/components/icons/Mic.vue';
import VCallEndIcon from '@/components/icons/CallEnd.vue';
import VVideocamIcon from '@/components/icons/Videocam.vue';
import VVideocamOffIcon from '@/components/icons/VideocamOff.vue';
import bus from '@/bus';

export default {
  name: 'UserPanel',
  props: {
    stream: {
      type: MediaStream,
    },
  },
  data: () => ({
    audio: {
      muted: false,
    },
    video: {
      upgraded: false,
      off: false,
    },
  }),
  computed: {
    videoTrack() {
      const tracks = this.stream.getVideoTracks();
      return tracks.length > 0 ? tracks[0] : null;
    },
  },
  methods: {
    toggleTrack(stream, type) {
      if (type === 'video') {
        if (!this.video.upgraded) {
          this.video.upgraded = !this.video.upgraded;
          bus.$emit('local.video.upgrade');
        } else {
          this.video.off = !this.video.off;
          bus.$emit('local.video.off');
        }
      }
      if (type === 'audio') {
        this.audio.muted = !this.audio.muted;
        bus.$emit('local.audio.mute', this.audio.muted);
      }
    },
    handleHangup() {
      bus.$emit('hangup');
    },
  },
  components: {
    VMicIcon, VMicMutedIcon, VCallEndIcon, VVideocamIcon, VVideocamOffIcon,
  },
};
</script>

<style>

</style>
