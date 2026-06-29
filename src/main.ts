import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vant from 'vant';
import 'vant/lib/index.css';
import './styles/theme.css';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';

createApp(App).use(createPinia()).use(router).use(Vant).use(i18n).mount('#app');
