import { defineStore } from 'pinia';

export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: (localStorage.getItem('theme') as Theme) || 'dark',
  }),
  getters: {
    isDark: state => state.theme === 'dark',
    isLight: state => state.theme === 'light',
  },
  actions: {
    setTheme(theme: Theme) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
    },
    toggleTheme() {
      const newTheme: Theme = this.theme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    },
    applyTheme() {
      const html = document.documentElement;
      if (this.theme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
      } else {
        html.classList.remove('dark');
        html.classList.add('light');
      }
      // 触发CSS变量更新
      document.body.style.setProperty('--current-theme', this.theme);
    },
    initTheme() {
      this.applyTheme();
    },
  },
});
