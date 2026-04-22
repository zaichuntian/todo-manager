import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import router from './router';
import './assets/css/main.css';
import './assets/css/common.css';
import 'element-plus/dist/index.css';
import App from './App.vue';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'; // 导入中文包

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn, // 全局配置中文
});
app.use(router);
app.use(createPinia());
app.mount('#app');
