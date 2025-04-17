import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Create app instance with shared state for theming
const app = createApp(App)

// Valid themes list for validation
const VALID_THEMES = ['default', 'hacker', 'terminal', 'amber', 'monokai']

// Add global property to track selected theme from ExcelLikeApp
app.config.globalProperties.selectedTheme = 'monokai' // Set monokai as default

// First, clear any possible theme classes to start fresh
function resetAllThemeClasses() {
  document.documentElement.classList.remove('theme-hacker')
  document.documentElement.classList.remove('theme-terminal')
  document.documentElement.classList.remove('theme-amber')
  document.documentElement.classList.remove('theme-monokai')
  document.documentElement.classList.remove('light-mode')
  document.documentElement.classList.remove('dark-mode')
}

// Apply theme class to html element based on saved preference
const savedTheme = localStorage.getItem('selectedTheme')

// Validate the saved theme
let themeToApply = 'monokai' // Default fallback
if (savedTheme && VALID_THEMES.includes(savedTheme)) {
  themeToApply = savedTheme
} else {
  // If theme is invalid or not set, reset to default
  localStorage.setItem('selectedTheme', themeToApply)
}

// Apply the validated theme
resetAllThemeClasses()
app.config.globalProperties.selectedTheme = themeToApply

if (themeToApply === 'hacker') {
  document.documentElement.classList.add('theme-hacker')
} else if (themeToApply === 'terminal') {
  document.documentElement.classList.add('theme-terminal')
} else if (themeToApply === 'amber') {
  document.documentElement.classList.add('theme-amber')
} else if (themeToApply === 'monokai') {
  document.documentElement.classList.add('theme-monokai')
} else if (themeToApply === 'default') {
  document.documentElement.classList.add('light-mode')
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
