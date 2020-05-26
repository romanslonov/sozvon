<template>
  <div
    class="fixed z-40 bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4"
    :class="[{'mr-64': chatOpened}]"
  >
    <div>
      <!-- <button
        @click="openSettings"
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
      >
        <v-settings-icon
          width="24"
          height="24"
          class="text-white"
        />
      </button> -->
    </div>
    <div class="flex items-center space-x-4">
      <button
        @click="toggleTrack('audio')"
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
      >
        <v-mic-muted-icon
          v-if="audio.muted"
          width="24"
          height="24"
          class="-mb-1"
          :class="[audio.muted ? 'text-black' : 'text-white']"
        />
        <v-mic-icon
          v-else
          width="24"
          height="24"
          class="-mb-1"
          :class="[audio.muted ? 'text-black' : 'text-white']"
        />
      </button>
      <!-- <button
        @click="toggleTrack('video')"
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
      >
        <v-videocam-off-icon
          v-if="video.off"
          width="24"
          height="24"
          :class="[video.off ? 'text-black' : 'text-white']"
        />
        <v-videocam-icon
          v-else
          width="24"
          height="24"
          :class="[video.off ? 'text-black' : 'text-white']"
        />
      </button> -->
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
    <div>
      <!-- <button
        @click="toggleChat"
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
      >
        <v-chat-icon width="20" height="20" :class="[chatOpened ? 'text-black' : 'text-white']" />
      </button> -->
    </div>
  </div>
</template>

<script>
import VMicMutedIcon from '@/components/icons/MicMuted.vue';
import VMicIcon from '@/components/icons/Mic.vue';
import VCallEndIcon from '@/components/icons/CallEnd.vue';
// import VVideocamIcon from '@/components/icons/Videocam.vue';
// import VVideocamOffIcon from '@/components/icons/VideocamOff.vue';
// import VChatIcon from '@/components/icons/Chat.vue';
// import VSettingsIcon from '@/components/icons/Settings.vue';
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
    chatOpened: false,
  }),
  methods: {
    toggleTrack(type) {
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
        // bus.$emit('local.audio.mute', this.audio.muted);
        this.$emit('muteAudio');
      }
    },
    toggleChat() {
      this.chatOpened = !this.chatOpened;
      return bus.$emit('chat.toggle');
    },
    openSettings() {

    },
    handleHangup() {
      // bus.$emit('hangup');
      this.$emit('hangup');
    },
  },
  components: {
    VMicIcon,
    VMicMutedIcon,
    VCallEndIcon,
    // VVideocamIcon,
    // VVideocamOffIcon,
    // VChatIcon,
    // VSettingsIcon,
  },
};
</script>

<style>

</style>
