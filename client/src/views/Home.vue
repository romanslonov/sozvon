<template>
  <div class="min-h-screen flex items-center justify-center">
    <form @submit.prevent="handleSubmit" class="flex items-center">
      <input
        class="text-2xl border-2 rounded h-16 px-4 focus:outline-none mr-4"
        type="text"
        v-model="form.hash"
        placeholder="Room name"
      />
      <button class="bg-purple-600 rounded text-white h-16 px-4 text-xl" type="submit">
        Start video chat
      </button>
    </form>
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
