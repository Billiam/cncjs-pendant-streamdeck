import { createPinia } from 'pinia'
import { createApp } from 'vue'

import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import EditorView from './views/Editor.vue'

const app = createApp(App, { child: EditorView })

const pinia = createPinia()
app.use(pinia)
app.use(PrimeVue)
app.use(ConfirmationService)
app.provide('pinia', pinia)
app.mount('#app')
