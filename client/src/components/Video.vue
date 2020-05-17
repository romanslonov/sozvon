<template>
  <div class="stream">
    <div class="stream__container">
      <video
        v-if="stream"
        class="stream__video"
        ref="video"
        autoplay
        playsinline
        :muted="muted"
        :class="{'is-mirrored': mirrored}"
      />
      <div class="stream__actions">
        <button @click="$emit('hangup')" class="h-16 w-16 rounded-full bg-red-600">H</button>
      </div>
    </div>
  </div>
</template>

<script>
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
  },
  data() {
    return {};
  },
  methods: {
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
  width: 480px;
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
</style>
