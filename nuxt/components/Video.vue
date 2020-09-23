<template>
  <div class="w-full">
    <div :class="[{'stream__container': !local}]">
      <div
        v-if="local"
        class="absolute centered-x z-20 bg-white rounded font-bold text-xs px-2"
        style="top:16px;"
      >
        {{ $parent.timer ? $parent.timer.getTimeValues().toString() : '00:00:00' }}
      </div>
      <div class="text-center centered">
        <MicMuted
          v-if="!audioTrack.enabled || muted"
          :width="local ? '72' : '32'"
          :height="local ? '72' : '32'"
          class="text-white"
        />
        <Mic
          v-else
          :width="local ? '72' : '32'"
          :height="local ? '72' : '32'"
          class="text-white"
        />
      </div>
      <div
        v-if="videoTrack && !videoTrack.enabled"
        class="z-10 text-center text-white centered"
      >
        <VideocamOff
          :width="local ? '72' : '32'"
          :height="local ? '72' : '32'"
          class="text-white mx-auto"
        />
        You turn off camera
      </div>
      <div
        v-if="local"
        class="absolute z-20 left-0 top-0 pl-4 pt-4"
      >
        <button
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
          @click="openSettings"
        >
          <Settings
            width="24"
            height="24"
            class="text-black"
          />
        </button>
      </div>
      <div
        v-if="local"
        class="absolute centered-y z-50"
        style="left: 16px;"
      >
        <div
          class="relative h-40 w-1 rounded-full overflow-hidden"
          style="background-color:rgba(255,255,255,0.3);"
        >
          <div
            class="absolute left-0 bottom-0 right-0 top-0 bg-white"
            :style="{ transform: `translateY(${100 - volume}%)` }"
          />
        </div>
      </div>
      <Video
        v-if="stream"
        ref="video"
        class="stream__video"
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
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
          @click="toggleTrack(stream, 'audio')"
        >
          <MicMuted
            v-if="!audioTrack.enabled"
            width="24"
            height="24"
            class="text-black -mb-1"
          />
          <Mic
            v-else
            width="24"
            height="24"
            class="text-black -mb-1"
          />
        </button>
        <button
          class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
          @click="toggleTrack(stream, 'video')"
        >
          <VideocamOff
            v-if="videoTrack && !videoTrack.enabled"
            width="24"
            height="24"
            class="text-black"
          />
          <Videocam
            v-else
            width="24"
            height="24"
            class="text-black"
          />
        </button>
        <button
          class="flex items-center justify-center h-12 w-12 rounded-full bg-red-600 shadow"
          @click="$emit('hangup')"
        >
          <CallEnd
            width="24"
            height="24"
            class="text-white"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
function connectStreamToVideoElement (stream, video) {
  if (stream) {
    if ('srcObject' in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream) // for older browsers
    }
    video.onloadedmetadata = () => {
      video.play()
    }
  }
}
export default {
  name: 'Video',
  props: {
    // eslint-disable-next-line vue/require-prop-types
    stream: {
      default: null
    },
    active: {
      type: Boolean,
      default: false
    },
    local: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '640'
    }
  },
  data () {
    return {
      volume: 0,
      localVolume: 0,
      audioMeter: null
    }
  },
  computed: {
    audioTrack () {
      const tracks = this.stream.getAudioTracks()
      return tracks.length > 0 ? tracks[0] : null
    },
    videoTrack () {
      const tracks = this.stream.getVideoTracks()
      return tracks.length > 0 ? tracks[0] : null
    }
  },
  watch: {
    stream (value) {
      this.doConnectStream(value)
    }
  },
  async mounted () {
    await this.doConnectStream(this.stream)
  },
  beforeDestroy () {
    // this.audioMeter.shutdown()
  },
  methods: {
    toggleTrack (stream, type) {
      if (type === 'video') {
        if (!this.videoTrack) {
          this.$emit('upgrade')
        } else {
          this.videoTrack.enabled = !this.videoTrack.enabled
        }
      }
      if (type === 'audio') {
        this.audioTrack.enabled = !this.audioTrack.enabled
        this.$emit('mute', !this.audioTrack.enabled)
      }
    },
    async doConnectStream (stream) {
      if (stream) {
        await this.$nextTick()
        await connectStreamToVideoElement(stream, this.$refs.video)
        this.initAudioMeter(stream)
      }
    }
    // initAudioMeter (stream) {
    //   const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    //   const mediaStreamSource = audioContext.createMediaStreamSource(stream)
    //   this.audioMeter = createAudioMeter(audioContext)

    //   mediaStreamSource.connect(this.audioMeter)

    //   this.drawLoop()
    // },
    // drawLoop () {
    //   this.volume = this.audioMeter.volume * 100 * 1.4

    //   // set up the next visual callback
    //   this.rafID = window.requestAnimationFrame(this.drawLoop)
    // },
    // openSettings () {
    //   // console.log('Open settings')
    // }
  }
}
</script>

<style lang="postcss">
.stream {
  max-width: 720px;
  margin: 0 auto;
}
.stream__container {
  @apply relative h-0 overflow-hidden rounded bg-black;
  padding-top: 56.25%;
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
  object-fit: cover;
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
.centered-y {
  @apply absolute;
  top: 50%;
  transform: translateY(-50%);
}
.centered-x {
  @apply absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
