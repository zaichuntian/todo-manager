import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import { createPinia } from 'pinia';
import './assets/css/main.css';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'; // 导入中文包

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn, // 全局配置中文
});
app.use(router);
app.use(createPinia());
app.mount('#app');
