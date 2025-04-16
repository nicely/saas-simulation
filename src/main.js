import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Create app instance with shared state for theming
const app = createApp(App)

// Add global property to track selected theme from ExcelLikeApp
app.config.globalProperties.selectedTheme = 'default'

// By default, set light mode
document.documentElement.classList.add('light-mode')
document.documentElement.classList.remove('dark-mode')
document.documentElement.classList.remove('theme-hacker')

// Apply theme class to html element based on system preference only if user hasn't selected a theme
const savedTheme = localStorage.getItem('selectedTheme')
if (!savedTheme) {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark-mode')
    document.documentElement.classList.remove('light-mode')
  }
}

// Listen for theme changes from system
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  // Only apply system preference if no user selection
  const currentTheme = localStorage.getItem('selectedTheme')
  if (!currentTheme) {
    if (event.matches) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.add('light-mode')
      document.documentElement.classList.remove('dark-mode')
    }
  }
})

app.mount('#app')
