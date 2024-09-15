import { createRouter, createWebHashHistory } from 'vue-router'
import { theme } from '@/lib/primevue-theme'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import Tooltip from 'primevue/tooltip'

import HomeView from './views/Home.vue'
import App from './App.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/editor', component: () => import('./views/Editor.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: theme,
    options: {},
  },
})
app.directive('tooltip', Tooltip)
app.provide('pinia', pinia)
app.mount('#app')
