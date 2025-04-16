<script setup>
import ExcelLikeApp from './ExcelLikeApp.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>Saas projection</h1>
    </header>
    <main>
      <ExcelLikeApp />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}
</style>
