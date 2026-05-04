import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import router from './router';
import './assets/styles/main.css';
import './assets/styles/common.css';
import './assets/styles/base/variables.less';
import './assets/styles/base/mixins.less';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles/themes/dark.css';
import App from './App.vue';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'; // 导入中文包
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

const app = createApp(App);
app.use(ElementPlus, {
  locale: zhCn, // 全局配置中文
});
app.use(router);
app.use(createPinia());
app.use(Particles, {
  init: async engine => {
    await loadSlim(engine);
  },
});
app.mount('#app');
