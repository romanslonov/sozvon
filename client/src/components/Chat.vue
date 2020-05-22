<template>
  <div class="fixed top-0 right-0 bottom-0 flex flex-col justify-end w-56 pt-4 pr-4">
    <div v-if="opened" class="bg-white shadow rounded-sm mb-20">
      <header class="uppercase text-xs font-bold border-b p-2">Chat</header>

      <main class="p-2 space-y-1">
        <div class="text-sm text-center" v-if="messages.length === 0">
          <div class="text-2xl">🤔</div>
          <div class="font-bold">Nothing here yet...</div>
        </div>

        <div
          v-for="message in messages"
          class="text-sm"
          :key="message.id"
          :class="[socket.id === message.from ? 'flex justify-end' : '']"
        >
          <div
            :class="[socket.id === message.from ? 'bg-gray-100 rounded px-1' : '']"
          >
            {{ message.content }}
          </div>
        </div>
      </main>

      <footer class="border-t">
        <input
          placeholder="Your message"
          v-model="content"
          class="w-full p-2 rounded-sm text-sm outline-none"
          @keydown.enter="send"
        />
      </footer>
    </div>

    <div class="absolute bottom-0 right-0 pb-4 pr-4">
      <button
        @click="toggleChat"
        class="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow"
      >
        <v-chat-icon width="24" height="24" class="text-black -mb-1" />
      </button>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid';
import VChatIcon from '@/components/icons/Chat.vue';

export default {
  props: {
    socket: Object,
  },
  created() {},
  data: () => ({
    opened: false,
    messages: [],
    content: '',
  }),
  methods: {
    toggleChat() {
      this.opened = !this.opened;
    },
    send() {
      if (this.content) {
        const message = {
          id: nanoid(),
          room: this.$route.params.id,
          from: this.socket.id,
          content: this.content,
        };
        this.socket.emit('message', message);
        this.messages.push(message);
        this.content = '';
      }
    },
  },
  components: { VChatIcon },
  watch: {
    socket(socket) {
      if (socket) {
        socket.on('message', (message) => {
          this.messages.push(message);
        });
      }
    },
  },
};
</script>
