import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import User from '../views/User.vue';
import Todo from '../views/Todo.vue';
import Layout from '../layouts/Layout.vue';
import Category from '../views/Category.vue';
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
});

export default router;
