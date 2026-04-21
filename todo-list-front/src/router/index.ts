import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserInfo } from '@/types/user.ts';

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../layouts/Layout.vue'),
    children: [
      { path: '', component: () => import('../views/Home.vue') },
      { path: '/user', component: () => import('../views/User.vue') },
      { path: '/todo', component: () => import('../views/Todo.vue') },
      { path: '/category', component: () => import('../views/Category.vue') },
    ],
  },
  { path: '/401', component: () => import('../views/401.vue') },
  { path: '/403', component: () => import('../views/403.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('../views/404.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(to => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') as UserInfo;
  // 如果用户未登录，且尝试访问需要登录的路由，重定向到401页面
  if (to.path !== '/login' && to.path !== '/401' && !userInfo.token && !userInfo.userUuid) {
    ElMessage.warning('请先登录');
    return '/401';
  }
  // 如果用户已登录，且尝试访问登录页，重定向到首页
  if (to.path === '/login' && userInfo.token && userInfo.userUuid) return '/';
  // 权限检查：只有超级管理员和管理员可以访问用户管理页面
  if (to.path === '/user' && userInfo.role !== 1 && userInfo.role !== 2) {
    ElMessage.warning('普通用户无权访问用户管理页面');
    return '/403';
  }
});

export default router;
