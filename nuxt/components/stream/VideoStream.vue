<template>
  <video
    v-if="stream"
    ref="video"
    class="object-cover w-full h-full"
    autoplay
    playsinline
    :muted="muted"
  />
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
  props: {
    // eslint-disable-next-line vue/require-prop-types
    stream: {
      default: null
    },
    muted: {
      type: Boolean,
      default: false
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
  methods: {
    async doConnectStream (stream) {
      if (stream) {
        await this.$nextTick()
        await connectStreamToVideoElement(stream, this.$refs.video)
      }
    }
  }
}
</script>
