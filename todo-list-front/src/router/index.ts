import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserInfo } from '@src-types/user';

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录页' },
  },
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    children: [
      { path: '', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
      { path: '/user', component: () => import('@/views/User.vue'), meta: { title: '用户管理' } },
      { path: '/todo', component: () => import('@/views/Todo.vue'), meta: { title: '任务管理' } },
      { path: '/category', component: () => import('@/views/Category.vue'), meta: { title: '分类管理' } },
      { path: '/profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人中心' } },
    ],
  },
  { path: '/401', component: () => import('@/views/401.vue'), meta: { title: '401' } },
  { path: '/403', component: () => import('@/views/403.vue'), meta: { title: '403' } },
  { path: '/empty', component: () => import('@/views/empty.vue'), meta: { title: '空页面' } },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/404.vue'), meta: { title: '404' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(to => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') as UserInfo;
  // 如果用户未登录，且尝试访问需要登录的路由，重定向到401页面
  if (to.path !== '/login' && to.path !== '/401' && to.path !== '/empty' && !userInfo.token && !userInfo.userUuid) {
    ElMessage.warning('请先登录');
    return '/401';
  }
  // 如果用户已登录，且尝试访问登录页，重定向到首页
  if (to.path === '/login' && userInfo.token && userInfo.userUuid) return '/';
  // 检查用户状态：如果账户已被禁用，提示用户
  if (userInfo.token && userInfo.userUuid && userInfo.status === 0) {
    ElMessage.error('您的账户已被禁用，请联系管理员开通权限');
    return '/401';
  }
  // 权限检查：只有超级管理员和管理员可以访问用户管理页面
  if (to.path === '/user' && !(userInfo.role === 1 || userInfo.role === 2)) {
    ElMessage.warning('普通用户无权访问用户管理页面');
    return '/403';
  }
});

router.afterEach(to => {
  document.title = (to.meta.title as string) || 'vue3-admin';
});

export default router;
