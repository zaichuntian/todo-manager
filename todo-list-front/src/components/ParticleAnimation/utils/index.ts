import * as THREE from 'three';
import { ERROR_MESSAGES } from '../constants';
import type { ParticleShape } from '../types';

// Three.js 场景类型
export interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animationId: number | null;
}

// 动画选项接口
export interface ParticleAnimationOptions {
  container: HTMLElement;
  particleCount?: number;
  backgroundColor?: string;
  particleSize?: number;
  particleShape?: ParticleShape;
}

// 验证颜色格式
export const validateColor = (color: string): void => {
  if (color === 'transparent') return;
  // 十六进制格式: #RRGGBB
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  // RGB格式: rgb(r, g, b)
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  // RGBA格式: rgba(r, g, b, a)
  const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/;

  if (!hexPattern.test(color) && !rgbPattern.test(color) && !rgbaPattern.test(color)) {
    throw new Error(ERROR_MESSAGES.INVALID_COLOR);
  }
};

export const isValidColor = (color: string): boolean => {
  if (color === 'transparent') return true;
  // 十六进制格式: #RRGGBB
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  // RGB格式: rgb(r, g, b)
  const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  // RGBA格式: rgba(r, g, b, a)
  const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/;

  return hexPattern.test(color) || rgbPattern.test(color) || rgbaPattern.test(color);
};

// 验证粒子数量
export const validateParticleCount = (count: number): void => {
  if (count < 100 || count > 10000) {
    throw new Error(ERROR_MESSAGES.INVALID_PARTICLE_COUNT);
  }
};

export const isValidParticleCount = (count: number): boolean => {
  return count >= 100 && count <= 10000;
};

// 验证粒子形状
export const validateParticleShape = (shape: string): void => {
  if (!['hexagon', 'triangle', 'heart'].includes(shape)) {
    throw new Error(ERROR_MESSAGES.INVALID_SHAPE);
  }
};

export const isValidParticleShape = (shape: string): shape is ParticleShape => {
  return ['hexagon', 'triangle', 'heart'].includes(shape);
};

// 初始化 Three.js 场景
export const initThreeScene = (container: HTMLElement): ThreeScene => {
  // 创建场景
  const scene = new THREE.Scene();

  // 获取容器尺寸，确保不为0
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const aspect = width / height;

  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // 监听窗口大小变化
  const handleResize = () => {
    const newWidth = container.clientWidth || window.innerWidth;
    const newHeight = container.clientHeight || window.innerHeight;

    if (newWidth > 0 && newHeight > 0) {
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
  };

  window.addEventListener('resize', handleResize);

  return {
    scene,
    camera,
    renderer,
    animationId: null,
  };
};

// 创建粒子纹理
export const createParticleTexture = (shape: ParticleShape) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 3;

    ctx.beginPath();

    switch (shape) {
      case 'hexagon':
        // 绘制六边形
        ctx.moveTo(centerX + radius, centerY);
        for (let i = 1; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        }
        ctx.closePath();
        break;

      case 'triangle':
        // 绘制三角形
        for (let i = 0; i < 3; i++) {
          const angle = ((Math.PI * 2) / 3) * i - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        break;

      case 'heart':
        // 绘制爱心
        ctx.moveTo(centerX, centerY - radius / 2);
        ctx.bezierCurveTo(
          centerX + radius,
          centerY - radius,
          centerX + radius,
          centerY + radius / 2,
          centerX,
          centerY + radius / 4
        );
        ctx.bezierCurveTo(
          centerX - radius,
          centerY + radius / 2,
          centerX - radius,
          centerY - radius,
          centerX,
          centerY - radius / 2
        );
        ctx.closePath();
        break;
    }

    // 绘制空心形状，只描边不填充
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
};

// 创建粒子系统
export const createParticleSystem = (scene: THREE.Scene, count: number, shape: ParticleShape): THREE.Points => {
  // 创建粒子几何体
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // 初始化粒子位置和颜色
  for (let i = 0; i < count * 3; i += 3) {
    // 分布在一个球形区域内，但确保粒子离相机有一定距离
    const minRadius = 2;
    const maxRadius = 5;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i] = radius * Math.sin(phi) * Math.cos(theta); // x
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
    positions[i + 2] = radius * Math.cos(phi); // z

    // 初始化颜色
    colors[i] = Math.random(); // r
    colors[i + 1] = Math.random(); // g
    colors[i + 2] = Math.random(); // b
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 创建粒子材质
  const particleTexture = createParticleTexture(shape);
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.06,
    map: particleTexture,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    depthTest: false,
    vertexColors: true,
  });

  // 创建粒子系统
  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  return particleSystem;
};

// 开始彩色粒子动画
export const startColorfulParticleAnimation = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  particleSystem: THREE.Points
): number => {
  const positions = particleSystem.geometry.attributes.position.array as Float32Array;
  const count = positions.length / 3;

  // 保存原始位置
  const originalPositions = new Float32Array(positions);

  const animate = () => {
    const time = Date.now() * 0.001; // 时间基准

    // 更新粒子位置，创造漂浮效果
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 添加轻微的随机漂浮效果
      positions[i3] = originalPositions[i3] + Math.sin(time * 0.5 + i) * 0.2;
      positions[i3 + 1] = originalPositions[i3 + 1] + Math.cos(time * 0.7 + i) * 0.2;
      positions[i3 + 2] = originalPositions[i3 + 2] + Math.sin(time * 0.3 + i) * 0.2;
    }

    // 通知几何体更新
    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  return requestAnimationFrame(animate);
};

// 清理 Three.js 资源
export const cleanUpThree = (renderer: THREE.WebGLRenderer, animationId: number | null) => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
};

// 粒子形状类型
export type { ParticleShape };
