<template>
  <div class="stream">
    <div
      class="stream__container"
      :class="[local ? 'rounded-lg' : 'rounded']"
      :style="{ width: `${width}px` }"
    >
      <div
        v-if="local"
        class="absolute bg-white rounded font-bold text-xs px-2" style="top:16px;left:16px;"
      >
        {{ $parent.timer ? $parent.timer.getTimeValues().toString() : '00:00:00' }}
      </div>
      <div class="text-center centered">
        <v-mic-muted-icon
          v-if="muted"
          :width="local ? '72' : '32'"
          :height="local ? '72' : '32'"
          class="text-white"
        />
        <v-mic-icon
          v-else
          :width="local ? '72' : '32'"
          :height="local ? '72' : '32'"
          class="text-white"
        />
      </div>
      <div
        v-if="local"
        class="absolute"
        style="top: 104px; right: 16px;"
      >
        <div
          class="relative h-40 w-1 rounded-full overflow-hidden"
          style="background-color:rgba(255,255,255,0.3);"
        >
          <div
            class="absolute left-0 top-0 bottom-0 right-0 top-0 bg-white"
            :style="{ transform: `translateY(${100 - volume}%)` }">
          </div>
        </div>
      </div>
      <video
        v-if="stream"
        class="stream__video"
        ref="video"
        autoplay
        playsinline
        :muted="local"
        :class="{'is-mirrored': local}"
      />
      <div
        v-if="local"
        class="flex items-start justify-center absolute left-0 bottom-0 right-0 p-4 space-x-4"
      >
        <button
          @click="toggleTrack(stream, 'audio')"
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
        >
          <v-mic-muted-icon v-if="muted" width="24" height="24" class="text-black -mb-1" />
          <v-mic-icon v-else width="24" height="24" class="text-black -mb-1" />
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
import VMicMutedIcon from '@/components/icons/MicMuted.vue';
import VVideocamOffIcon from '@/components/icons/VideocamOff.vue';
import VCallEndIcon from '@/components/icons/CallEnd.vue';
import createAudioMeter from '@/audioMeter';

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
  }
}
export default {
  name: 'Video',
  props: {
    stream: {
      type: [MediaStream, Object],
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    local: {
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
      volume: 0,
      localVolume: 0,
      audioMeter: null,
      muted: false,
    };
  },
  methods: {
    toggleTrack(stream, type) {
      stream.getTracks().forEach((track) => {
        if (track.kind === type) {
          track.enabled = !track.enabled;
        }
        if (type === 'audio') {
          this.muted = !this.muted;
        }
      });
    },
    async doConnectStream(stream) {
      if (stream) {
        await this.$nextTick();
        await connectStreamToVideoElement(stream, this.$refs.video);
        this.initAudioMeter(stream);
      }
    },
    initAudioMeter(stream) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      this.audioMeter = createAudioMeter(audioContext);

      mediaStreamSource.connect(this.audioMeter);

      this.drawLoop();
    },
    drawLoop() {
      this.volume = this.audioMeter.volume * 100 * 1.4;

      // set up the next visual callback
      this.rafID = window.requestAnimationFrame(this.drawLoop);
    },
  },
  async mounted() {
    await this.doConnectStream(this.stream);
  },
  beforeDestroy() {
    this.audioMeter.shutdown();
  },
  watch: {
    stream(value) {
      this.doConnectStream(value);
    },
  },
  components: {
    VMicIcon, VVideocamOffIcon, VCallEndIcon, VMicMutedIcon,
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
