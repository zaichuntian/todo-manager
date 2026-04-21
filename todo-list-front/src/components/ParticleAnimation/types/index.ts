// 粒子形状类型
export type ParticleShape = 'hexagon' | 'triangle' | 'heart';

// 组件属性类型
export interface ParticleAnimationProps {
  particleCount?: number;
  backgroundColor?: string;
  particleShape?: ParticleShape;
}
