import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from "vue-toastification";

import '@assets/app.scss'
import "vue-toastification/dist/index.css";
import VueLazyLoad from 'vue3-lazyload';
import { fullscreenImagePlugin } from '@plugins/fullscreen-image-plugin';
import '@plugins/fullscreen-image-plugin/assets/style.css';
// import VueDatePicker from '@vuepic/vue-datepicker';
// import '@vuepic/vue-datepicker/dist/main.css';
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)
app.use(createPinia())
app.use(router)
// app.component('VueDatePicker', VueDatePicker);
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

app.use(Toast, {
  position: "bottom-right",
});

app.use(VueLazyLoad, {
  // options...
})
app.use(fullscreenImagePlugin)
app.mount('#app')

