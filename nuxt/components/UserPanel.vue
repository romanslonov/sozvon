<template>
  <div
    v-if="stream"
    class="fixed z-40 bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4"
  >
    <div>
      <!-- <button
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          bg-black
          bg-opacity-50
          rounded-full
          shadow
          focus:outline-none
        "
        @click="openSettings"
      >
        <Settings
          width="24"
          height="24"
          class="text-white"
        />
      </button> -->
    </div>
    <div class="flex items-center space-x-4">
      <button
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          shadow
          focus:outline-none
        "
        :class="[audio.muted ? 'bg-white' : 'bg-black bg-opacity-50']"
        @click="toggleTrack(stream, 'audio')"
      >
        <MicMuted
          v-if="audio.muted"
          width="24"
          height="24"
          class="-mb-1"
          :class="[audio.muted ? 'text-black' : 'text-white']"
        />
        <Mic
          v-else
          width="24"
          height="24"
          class="-mb-1"
          :class="[audio.muted ? 'text-black' : 'text-white']"
        />
      </button>
      <button
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          shadow
          focus:outline-none
        "
        :class="[screen.shared ? 'bg-white' : 'bg-black bg-opacity-50']"
        @click="toggleScreenShare"
      >
        <ScreenShareOff
          v-if="screen.shared"
          width="24"
          height="24"
          :class="[screen.shared ? 'text-black' : 'text-white']"
        />
        <ScreenShare
          v-else
          width="24"
          height="24"
          :class="[screen.shared ? 'text-black' : 'text-white']"
        />
      </button>
      <button
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          shadow
          focus:outline-none
        "
        :class="[video.off ? 'bg-white' : 'bg-black bg-opacity-50']"
        @click="toggleTrack(stream, 'video')"
      >
        <VideocamOff
          v-if="video.off"
          width="24"
          height="24"
          :class="[video.off ? 'text-black' : 'text-white']"
        />
        <Videocam
          v-else
          width="24"
          height="24"
          :class="[video.off ? 'text-black' : 'text-white']"
        />
      </button>
      <button
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
        @click="handleHangup"
      >
        <CallEnd
          width="24"
          height="24"
          class="text-white"
        />
      </button>
    </div>
    <div>
      <!-- <button
        class="
          flex
          items-center
          justify-center
          h-12
          w-12
          rounded-full
          shadow
          focus:outline-none
        "
        :class="[chatOpened ? 'bg-white' : 'bg-black bg-opacity-50']"
        @click="toggleChat"
      >
        <Chat
          width="20"
          height="20"
          :class="[chatOpened ? 'text-black' : 'text-white']"
        />
      </button> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserPanel',
  props: {
    // eslint-disable-next-line vue/require-prop-types
    stream: {
      default: null
    }
  },
  data: () => ({
    audio: {
      muted: false
    },
    video: {
      upgraded: false,
      off: false
    },
    screen: {
      shared: false
    },
    chatOpened: false
  }),
  methods: {
    toggleTrack (stream, type) {
      if (type === 'video') {
        if (!this.video.upgraded) {
          this.video.upgraded = !this.video.upgraded
          this.$nuxt.$emit('local.video.upgrade')
        } else {
          this.video.off = !this.video.off
          this.$nuxt.$emit('local.video.off')
        }
      }
      if (type === 'audio') {
        this.audio.muted = !this.audio.muted
        this.$nuxt.$emit('local.audio.mute', this.audio.muted)
      }
    },
    toggleChat () {
      this.chatOpened = !this.chatOpened
      this.$nuxt.$emit('chat.toggle')
    },
    toggleScreenShare () {
      this.screen.shared = !this.screen.shared
      this.$nuxt.$emit('local.screen.share', this.screen.shared)
    },
    openSettings () {

    },
    handleHangup () {
      this.$nuxt.$emit('hangup')
    }
  }
}
</script>

<style>
</style>
