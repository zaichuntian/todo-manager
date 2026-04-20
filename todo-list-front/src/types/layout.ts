// 布局相关类型定义

// 菜单配置项
export interface MenuItem {
  index: string;
  title: string;
  icon: string;
}

// 布局状态
export interface LayoutState {
  isCollapsed: boolean;
  activeMenu: string;
}

// 动画配置
export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease: string;
}
