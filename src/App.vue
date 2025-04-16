<script setup>
import ExcelLikeApp from './ExcelLikeApp.vue'
</script>

<template>
  <div class="app" :class="{ 'theme-hacker': $root && $root.selectedTheme === 'hacker' }">
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
  background-color: var(--bg-color, #fff);
  color: var(--text-color, #333);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  margin: 0 auto;
  padding: 0;
  min-height: 100vh;
  background-color: var(--bg-color, #fff);
  color: var(--text-color, #333);
}

header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color, #eee);
  text-align: center;
  font-size: 14px;
  color: var(--text-color, #666);
}

footer a {
  color: var(--link-color, #3498db);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

:root {
  --bg-color: #fff;
  --border-color: #eee;
  --text-color: #666;
  --link-color: #3498db;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #121212;
    --border-color: #333;
    --text-color: #bbb;
    --link-color: #5dade2;
  }
}

/* Hacker theme overrides */
.theme-hacker {
  --bg-color: #000;
  --border-color: #0f0;
  --text-color: #0f0;
  --link-color: #0f0;
}

.theme-hacker footer {
  text-shadow: 0 0 5px #0f0;
}

.theme-hacker footer a {
  color: #0f0 !important;
  text-decoration: underline;
  text-shadow: 0 0 5px #0f0;
}

.theme-hacker footer a:hover {
  text-shadow: 0 0 10px #0f0;
}
</style>
