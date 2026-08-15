import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routes'
import quasarPlugin from './plugins/quasar'
import apexchartsPlugin from './plugins/apexcharts'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

import { useAuthStore } from './store/authStore'
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)
app.use(quasarPlugin)
app.use(apexchartsPlugin)

app.mount('#app')
