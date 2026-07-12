import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

function showError(message: string, error?: unknown) {
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;top:0;left:0;right:0;bottom:0;padding:24px;background:#fff;color:#d00;font-family:monospace;white-space:pre-wrap;overflow:auto;z-index:99999'
  container.textContent = message + '\n\n' + (error ? String(error) : '')
  document.body.appendChild(container)
}

try {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.mount('#app')
} catch (error) {
  showError('App mount failed:', error)
}

window.addEventListener('error', (event) => {
  showError('Global error:\n' + event.message + '\n' + (event.filename || '') + ':' + (event.lineno || 0), event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  showError('Unhandled promise rejection:', event.reason)
})