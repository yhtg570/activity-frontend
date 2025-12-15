import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/theme.css'  // 导入统一的主题样式
import './assets/icon.css'   // 导入图标样式


createApp(App)
  .use(router)
  .mount('#app')