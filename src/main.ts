import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { trackErrors } from './services/errors'

const app = createApp(App)
trackErrors(app)
app.mount('#app')
