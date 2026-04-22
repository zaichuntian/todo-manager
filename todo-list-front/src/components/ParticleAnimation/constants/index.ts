// 错误消息
export const ERROR_MESSAGES = {
  INVALID_CONTAINER: 'Container must be a valid HTMLElement',
  INVALID_PARTICLE_COUNT: 'Particle count must be between 100 and 10000',
  INVALID_COLOR: 'Invalid color format. Please use hex (#RRGGBB), rgb(r, g, b), or rgba(r, g, b, a)',
  INVALID_SHAPE: 'Invalid particle shape. Please use one of: hexagon, triangle, heart',
};

// 默认值
export const DEFAULT_VALUES = {
  PARTICLE_COUNT: 2000,
  PARTICLE_SHAPE: 'hexagon' as const,
  BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.5)',
};