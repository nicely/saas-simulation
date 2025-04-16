import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Create app instance with shared state for theming
const app = createApp(App)

// Add global property to track selected theme from ExcelLikeApp
app.config.globalProperties.selectedTheme = 'monokai' // Set monokai as default

// By default, set monokai theme
document.documentElement.classList.add('theme-monokai')
document.documentElement.classList.remove('light-mode')
document.documentElement.classList.remove('dark-mode')
document.documentElement.classList.remove('theme-terminal')
document.documentElement.classList.remove('theme-amber')
document.documentElement.classList.remove('theme-hacker')

// Apply theme class to html element based on system preference only if user hasn't selected a theme
const savedTheme = localStorage.getItem('selectedTheme')
if (savedTheme) {
  app.config.globalProperties.selectedTheme = savedTheme
  
  // Apply the correct theme based on saved preference
  if (savedTheme === 'hacker') {
    document.documentElement.classList.add('theme-hacker')
    document.documentElement.classList.remove('theme-terminal')
    document.documentElement.classList.remove('light-mode')
    document.documentElement.classList.remove('dark-mode')
    document.documentElement.classList.remove('theme-amber')
    document.documentElement.classList.remove('theme-monokai')
  } else if (savedTheme === 'terminal') {
    document.documentElement.classList.add('theme-terminal')
    document.documentElement.classList.remove('theme-hacker')
    document.documentElement.classList.remove('light-mode')
    document.documentElement.classList.remove('dark-mode')
    document.documentElement.classList.remove('theme-amber')
    document.documentElement.classList.remove('theme-monokai')
  } else if (savedTheme === 'amber') {
    document.documentElement.classList.add('theme-amber')
    document.documentElement.classList.remove('theme-hacker')
    document.documentElement.classList.remove('theme-terminal')
    document.documentElement.classList.remove('light-mode')
    document.documentElement.classList.remove('dark-mode')
    document.documentElement.classList.remove('theme-monokai')
  } else if (savedTheme === 'monokai') {
    document.documentElement.classList.add('theme-monokai')
    document.documentElement.classList.remove('theme-hacker')
    document.documentElement.classList.remove('theme-terminal')
    document.documentElement.classList.remove('theme-amber')
    document.documentElement.classList.remove('light-mode')
    document.documentElement.classList.remove('dark-mode')
  } else if (savedTheme === 'default') {
    document.documentElement.classList.add('light-mode')
    document.documentElement.classList.remove('theme-hacker')
    document.documentElement.classList.remove('theme-terminal')
    document.documentElement.classList.remove('theme-amber')
    document.documentElement.classList.remove('theme-monokai')
    document.documentElement.classList.remove('dark-mode')
  }
} else {
  // If no saved theme, set monokai as default and save it
  localStorage.setItem('selectedTheme', 'monokai')
}

// Listen for theme changes from system
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  // Only apply system preference if no user selection or using default theme
  const currentTheme = localStorage.getItem('selectedTheme')
  if (!currentTheme || currentTheme === 'default') {
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
