import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import User from '../views/User.vue';
import Todo from '../views/Todo.vue';
import Layout from '../layouts/Layout.vue';

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: '/user', component: User },
      { path: '/todo', component: Todo },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(to => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) return '/login';
  if (to.path === '/login' && token) return '/';
});

export default router;
