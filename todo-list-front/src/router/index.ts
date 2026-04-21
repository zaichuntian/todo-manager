import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import User from '../views/User.vue';
import Todo from '../views/Todo.vue';
import Layout from '../layouts/Layout.vue';
import Category from '../views/Category.vue';
import Page404 from '../views/404.vue';
import Page403 from '../views/403.vue';
import { ElMessage } from 'element-plus';
import { UserInfo } from '@/types/user.ts';

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: '/user', component: User },
      { path: '/todo', component: Todo },
      { path: '/category', component: Category },
    ],
  },
  { path: '/403', component: Page403 },
  { path: '/:pathMatch(.*)*', component: Page404 },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(to => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') as UserInfo;
  // 如果用户未登录，且尝试访问需要登录的路由，重定向到登录页
  if (to.path !== '/login' && !userInfo.token && !userInfo.userUuid) return '/login';
  // 如果用户已登录，且尝试访问登录页，重定向到首页
  if (to.path === '/login' && userInfo.token && userInfo.userUuid) return '/';
  // 权限检查：只有超级管理员和管理员可以访问用户管理页面
  if (to.path === '/user' && userInfo.role !== 1 && userInfo.role !== 2) {
    ElMessage.warning('普通用户无权访问用户管理页面');
    return '/403';
  }
});

export default router;
