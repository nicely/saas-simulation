<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>
  <h2>Hello World!</h2>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped>
.card {
  padding: 2em;
}

button {
  padding: 0.5em 1em;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  border: none;
}

button:hover {
  background-color: #45a049;
}
</style>
