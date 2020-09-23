<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center">
      <Logo width="80" height="80" />
      <h1 class="text-5xl font-bold mb-8">
        Join a room to start talking
      </h1>
      <form class="flex items-center mx-auto" @submit.prevent="handleSubmit">
        <input
          v-model="form.id"
          required
          class="
            text-2xl
            border-2
            rounded
            h-16
            px-6
            focus:border-blue-600
            focus:outline-none
            focus:shadow
            mr-4
          "
          type="text"
          placeholder="unique id"
        >
        <button class="bg-blue-600 rounded text-white h-16 px-12 text-xl" type="submit">
          Join now
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'

export default {
  name: 'Home',
  data: () => ({
    form: {
      id: ''
    }
  }),
  created () {
    this.form.id = process.env.NODE_ENV === 'development' ? 'development' : nanoid(5)
  },
  methods: {
    handleSubmit () {
      this.$router.push({
        name: 'slug',
        params: { slug: this.form.id, initiator: true }
      })
    }
  }
}
</script>
