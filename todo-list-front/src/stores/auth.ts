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
    // 退出登录，保留用户信息（用于登录框展示）
    logout() {
      if (this.userInfo) {
        // 只清除 token，保留其他信息
        const { token, ...rest } = this.userInfo;
        this.userInfo = rest as UserInfo;
        localStorage.setItem('userInfo', JSON.stringify(rest));
      }
    },
  },
});
