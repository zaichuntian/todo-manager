import { defineStore } from 'pinia';
import type { UserInfo } from '@src-types/user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}') as UserInfo,
  }),
  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    clearUserInfo() {
      this.userInfo = {} as UserInfo;
      localStorage.removeItem('userInfo');
    },
  },
});
