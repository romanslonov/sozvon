<template>
  <div class="stream">
    <div class="stream__container" :style="{ width: `${width}px` }">
      <div
        v-if="local"
        class="absolute bg-white rounded font-bold text-xs px-2" style="top:12px;left:12px;"
      >
        {{ timer }}
      </div>
      <div class="text-center centered">
        <v-mic-icon :width="local ? '72' : '32'" :height="local ? '72' : '32'" class="text-white" />
      </div>
      <video
        v-if="stream"
        class="stream__video"
        ref="video"
        autoplay
        playsinline
        :muted="muted"
        :class="{'is-mirrored': mirrored}"
      />
      <div
        v-if="local"
        class="flex items-start justify-center absolute left-0 bottom-0 right-0 p-4 space-x-4"
      >
        <button
          @click="toggleTrack(stream, 'audio')"
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
        >
          <v-mic-icon width="24" height="24" class="text-black" />
        </button>
        <button
          disabled
          @click="toggleTrack(stream, 'video')"
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow opacity-50"
        >
          <v-videocam-off-icon width="24" height="24" class="text-black" />
        </button>
        <button
          @click="$emit('hangup')"
          class="flex items-center justify-center h-12 w-12 rounded-full bg-red-600 shadow"
        >
          <v-call-end-icon width="24" height="24" class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VMicIcon from '@/components/icons/Mic.vue';
import VVideocamOffIcon from '@/components/icons/VideocamOff.vue';
import VCallEndIcon from '@/components/icons/CallEnd.vue';

/* eslint-disable no-param-reassign */
async function connectStreamToVideoElement(stream, video) {
  // console.log('connectStreamToVideoElement', stream, video);
  if (stream) {
    if ('srcObject' in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream); // for older browsers
    }
    video.onloadedmetadata = () => {
      video.play();
    };
    // setInterval(async () => {
    //   try {
    //     let result = await video.play()
    //     log('play ok', result)
    //   } catch (err) {
    //     log('play error', err)
    //   }
    // }, 1000)
  }
}
export default {
  name: 'app-video',
  props: {
    stream: {
      type: [MediaStream, Object],
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    local: {
      type: Boolean,
      default: false,
    },
    mirrored: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '640',
    },
  },
  data() {
    return {
      timer: '00:00',
    };
  },
  methods: {
    toggleTrack(stream, type) {
      stream.getTracks().forEach((track) => {
        if (track.kind === type) {
          track.enabled = !track.enabled;
        }
      });
    },
    async doConnectStream(stream) {
      // console.log('doConnectStream', this.title, stream);
      if (stream) {
        await this.$nextTick();
        await connectStreamToVideoElement(stream, this.$refs.video);
        // stream.onaddtrack = async () =>
        // await connectStreamToVideoElement(stream, this.$refs.video)
        // stream.onremovetrack = async () =>
        // await connectStreamToVideoElement(stream, this.$refs.video)
      }
    },
  },
  async mounted() {
    // webrtc.on('stream', async () => {
    //   await this.$nextTick()
    //   await this.doConnectStream(this.stream)
    // })
    await this.doConnectStream(this.stream);
  },
  watch: {
    stream(value) {
      this.doConnectStream(value);
    },
  },
  components: {
    VMicIcon, VVideocamOffIcon, VCallEndIcon,
  },
};
</script>

<style lang="postcss">
.stream {
  max-width: 720px;
  margin: 0 auto;
}
.stream__container {
  position: relative;
  height: 0;
  padding-top: 56.25%;
  background:#202124;
  /* width: 640px; */
  overflow: hidden;
  border-radius: 8px;
}
.stream__actions {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  padding: 16px;
  width: 100%;
}
.stream__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.stream__video.is-mirrored {
  transform: matrix(-1, 0, 0, 1, 0, 0);
}
.centered {
  @apply absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
