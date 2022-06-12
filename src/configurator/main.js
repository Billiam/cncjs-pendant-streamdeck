import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import App from './Configurator.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
