import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import HomeView from './views/Home.vue'

const app = createApp(App, { child: HomeView })

const pinia = createPinia()
app.use(pinia)
app.provide('pinia', pinia)
app.mount('#app')
