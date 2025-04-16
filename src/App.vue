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
    <footer>
      <p>The underlying logic of this simulation was crafted by <a href="https://x.com/cembingool" target="_blank">Cem</a>, Head of Data at Juphy.</p>
    </footer>
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

footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 14px;
  color: #666;
}

footer a {
  color: #3498db;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
