import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/dist/index.css';
import '@styles/base/variables.less';
import '@styles/base/mixins.less';
import '@styles/main.css';
import '@styles/common.css';
import '@styles/themes/dark.css';
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'; // 导入中文包
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';
import { logger } from '@utils/logger';
import App from './App.vue';

const app = createApp(App);

logger.info('================= 应用启动 ==================');
logger.info('环境:', import.meta.env.MODE);
logger.info('API地址：', import.meta.env.VITE_API_URL);
logger.info('版本：', import.meta.env.VITE_APP_VERSION);

app.use(ElementPlus, {
  locale: zhCn, // 全局配置中文
});
logger.success('Element Plus 加载完成');

app.use(router);
logger.success('路由加载完成');

app.use(createPinia());
logger.success('Pinia 加载完成');

app.use(Particles, {
  init: async engine => {
    await loadSlim(engine);
  },
});
logger.success('粒子动画加载完成');

app.mount('#app');
logger.success('应用挂载完成');
logger.info('=========================================');
