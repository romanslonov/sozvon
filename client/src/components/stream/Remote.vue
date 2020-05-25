<template>
  <div>
    <div class="aspect-ratio relative overflow-hidden bg-black rounded">
      <div class="absolute z-10 top-0 left-0 pt-2 pl-2">
        <div class="bg-white rounded-sm font-bold text-xs shadow px-1">{{ id  }}</div>
      </div>
      <div class="centered">
        <v-mic-muted-icon v-if="audioMuted" width="32" height="32" class="text-white" />
        <v-mic-icon v-else width="32" height="32" class="text-white" />
      </div>
      <div v-if="videoTrack && videoOff" class="centered z-50">
        <v-videocam-off-icon width="32" height="32" class="text-white" />
      </div>
      <div v-if="stream" class="absolute z-10 right-0 bottom-0 pr-2 pb-2">
        <v-mic-muted-icon
          v-if="videoTrack && audioMuted"
          class="text-white"
          width="24"
          height="24"
        />
      </div>
      <v-video class="absolute inset-0" :stream="stream" :local="local"></v-video>
    </div>
  </div>
</template>

<script>
import VVideo from '@/components/stream/Video.vue';
import VMicMutedIcon from '@/components/icons/MicMuted.vue';
import VMicIcon from '@/components/icons/Mic.vue';
// import VVideocamIcon from '@/components/icons/Videocam.vue';
import VVideocamOffIcon from '@/components/icons/VideocamOff.vue';

export default {
  props: {
    id: {
      type: String,
    },
    stream: {
      type: MediaStream,
    },
    audioMuted: {
      type: Boolean,
      default: false,
    },
    videoOff: {
      type: Boolean,
      default: false,
    },
    local: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    audioTrack() {
      const tracks = this.stream.getAudioTracks();
      return tracks.length > 0 ? tracks[0] : null;
    },
    videoTrack() {
      const tracks = this.stream.getVideoTracks();
      return tracks.length > 0 ? tracks[0] : null;
    },
  },
  methods: {
    toggleTrack(stream, type) {
      if (type === 'video') {
        if (!this.videoTrack) {
          this.$emit('upgrade');
        } else {
          this.videoTrack.enabled = !this.videoTrack.enabled;
        }
      }
      if (type === 'audio') {
        this.audioTrack.enabled = !this.audioTrack.enabled;
        this.$emit('mute', !this.audioTrack.enabled);
      }
    },
  },
  components: {
    VVideo, VMicIcon, VMicMutedIcon, VVideocamOffIcon, /* , VVideocamOffIcon */
  },
  watch: {},
};
</script>

<style lang="postcss">
.centered {
  @apply absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.aspect-ratio {
  height: 0;
  padding-bottom: 56.25%;
}
</style>
