<template>
  <video
    v-if="stream"
    class="object-cover w-full h-full"
    ref="video"
    autoplay
    playsinline
    :muted="muted"
  />
</template>

<script>

/* eslint-disable no-param-reassign */
async function connectStreamToVideoElement(stream, video) {
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
  props: {
    stream: {
      type: MediaStream,
    },
    muted: {
      type: Boolean,
      default: false,
    },
  },
  async mounted() {
    await this.doConnectStream(this.stream);
  },
  methods: {
    async doConnectStream(stream) {
      if (stream) {
        await this.$nextTick();
        await connectStreamToVideoElement(stream, this.$refs.video);
      }
    },
  },
  watch: {
    stream(value) {
      this.doConnectStream(value);
    },
  },
};
</script>

<style>

</style>
