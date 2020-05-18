<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center">
      <h1 class="text-5xl font-bold mb-8">Join a room and start talking</h1>
      <form @submit.prevent="handleSubmit" class="flex items-center mx-auto">
        <input
          required
          class="
            text-2xl border-2 rounded h-16 px-6 focus:border-blue-600 focus:outline-none mr-4
          "
          type="text"
          v-model="form.hash"
          placeholder="unique id"
        />
        <button class="bg-blue-600 rounded text-white h-16 px-12 text-xl" type="submit">
          Join now
        </button>
      </form>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data: () => ({
    form: {
      hash: '',
    },
  }),
  methods: {
    handleSubmit() {
      this.$router.push({
        name: 'Channel',
        params: { id: this.form.hash, initiator: true },
      });
    },
  },
  components: {},
};
</script>
