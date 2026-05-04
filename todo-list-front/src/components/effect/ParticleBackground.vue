<template>
  <div ref="containerRef" class="particle-background"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const containerRef = ref<HTMLDivElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animationId: number | null = null;

// 鼠标位置（归一化坐标）
let mouseX = 0;
let mouseY = 0;
let mouseZ = 0;
let hasMouse = false;

// 粒子状态（用于 InstancedMesh）
const PARTICLE_COUNT = 400; // 减少粒子数量
interface ParticleState {
  vx: number;
  vy: number;
  vz: number;
  targetVx: number;
  targetVy: number;
  targetVz: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  ripplePhase: number;
  rippleSpeed: number;
  rippleScale: number;
  time: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}
const particleStates: ParticleState[] = [];
let instancedMesh: THREE.InstancedMesh | null = null;

// 星星状态（用于 Points）
interface StarState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  baseOpacity: number;
}
const starStates: StarState[] = [];
let starPoints: THREE.Points | null = null;

// 初始化粒子状态
const initParticleStates = () => {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const baseSpeed = 0.002;
    const vx = (Math.random() - 0.5) * baseSpeed * 2;
    const vy = (Math.random() - 0.5) * baseSpeed * 2;
    const vz = (Math.random() - 0.5) * baseSpeed * 2;

    particleStates.push({
      vx,
      vy,
      vz,
      targetVx: vx,
      targetVy: vy,
      targetVz: vz,
      rotateX: (Math.random() - 0.5) * 0.02,
      rotateY: (Math.random() - 0.5) * 0.02,
      rotateZ: (Math.random() - 0.5) * 0.02,
      ripplePhase: Math.random() * Math.PI * 2,
      rippleSpeed: 0.02 + Math.random() * 0.02,
      rippleScale: 0.2 + Math.random() * 0.2,
      time: 0,
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0),
    });
  }
};

// 初始化星星状态
const initStarStates = (count: number) => {
  for (let i = 0; i < count; i++) {
    const speed = 0.0008 + Math.random() * 0.0015;
    const angle = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;

    starStates.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 6,
      z: 0.5 + Math.random() * 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: Math.sin(angle2) * speed * 0.5,
      twinkleSpeed: 1.5 + Math.random() * 2.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.3 + Math.random() * 0.4,
    });
  }
};

const init = () => {
  if (!containerRef.value) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器（优化：限制像素比）
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制最大像素比
  renderer.setClearColor(0x000000, 0);
  containerRef.value.appendChild(renderer.domElement);

  // 初始化状态
  initParticleStates();
  initStarStates(150); // 减少星星数量

  // 优化：使用 InstancedMesh
  createInstancedParticles();

  // 优化：使用 Points 渲染星星
  createStarPoints();

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    if (!instancedMesh || !starPoints || !scene || !camera) return;

    // 更新粒子（使用 InstancedMesh）
    updateParticles();

    // 更新星星（使用 Points）
    updateStars();

    // 渲染场景
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
};

// 创建 InstancedMesh 粒子
const createInstancedParticles = () => {
  if (!scene) return;

  // 优化：使用简单几何体
  const geometry = new THREE.SphereGeometry(0.03, 8, 8);

  // 实例化颜色数据（存储在 userData 中，通过着色器使用）
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    colors[i * 3] = 0.3 + Math.random() * 0.35;
    colors[i * 3 + 1] = 0.3 + Math.random() * 0.35;
    colors[i * 3 + 2] = 0.4 + Math.random() * 0.4;
  }

  // 使用自定义着色器支持实例化颜色
  const material = new THREE.ShaderMaterial({
    uniforms: {
      instanceColors: { value: new THREE.DataTexture(colors, PARTICLE_COUNT, 1, THREE.RGBFormat, THREE.FloatType) },
    },
    vertexShader: `
      attribute vec3 instanceColor;
      varying vec3 vColor;
      void main() {
        vColor = instanceColor;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 0.7);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });

  instancedMesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
  scene.add(instancedMesh);

  // 设置初始矩阵
  const matrices = new Float32Array(PARTICLE_COUNT * 16);
  particleStates.forEach((state, i) => {
    const matrix = new THREE.Matrix4();
    matrix.compose(state.position, new THREE.Quaternion().setFromEuler(state.rotation), new THREE.Vector3(1, 1, 1));
    matrix.toArray(matrices, i * 16);
  });
  instancedMesh.instanceMatrix.set(matrices);
  instancedMesh.instanceMatrix.needsUpdate = true;
};

// 创建星星 Points
const createStarPoints = () => {
  if (!scene) return;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starStates.length * 3);
  const opacities = new Float32Array(starStates.length);

  starStates.forEach((star, i) => {
    positions[i * 3] = star.x;
    positions[i * 3 + 1] = star.y;
    positions[i * 3 + 2] = star.z;
    opacities[i] = star.baseOpacity;
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      attribute float opacity;
      varying float vOpacity;
      varying vec3 vPosition;
      void main() {
        vOpacity = opacity;
        vPosition = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying float vOpacity;
      varying vec3 vPosition;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = (1.0 - dist * 2.0) * vOpacity;
        float twinkle = sin(time * 2.0 + vPosition.x + vPosition.y) * 0.3 + 0.7;
        alpha *= twinkle;
        vec3 color = vec3(1.0, 1.0, 1.0);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  starPoints = new THREE.Points(geometry, material);
  scene.add(starPoints);
};

// 更新粒子
const updateParticles = () => {
  if (!instancedMesh) return;

  const matrices = instancedMesh.instanceMatrix.array as Float32Array;
  const bound = 5;
  const damping = 0.08;
  const friction = 0.98;

  particleStates.forEach((state, i) => {
    // 鼠标吸附效果
    if (hasMouse) {
      const dx = mouseX - state.position.x;
      const dy = mouseY - state.position.y;
      const dz = mouseZ - state.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 3 && distance > 0.5) {
        const force = ((3 - distance) / 3) * 0.01;
        state.position.x += dx * force;
        state.position.y += dy * force;
        state.position.z += dz * force;
      }
    }

    // 位置移动
    state.position.x += state.vx;
    state.position.y += state.vy;
    state.position.z += state.vz;

    // 边界检测
    if (Math.abs(state.position.x) > bound) {
      state.vx *= -1;
      state.targetVx *= -1;
    }
    if (Math.abs(state.position.y) > bound) {
      state.vy *= -1;
      state.targetVy *= -1;
    }
    if (Math.abs(state.position.z) > bound) {
      state.vz *= -1;
      state.targetVz *= -1;
    }

    // 阻尼效果
    state.vx += (state.targetVx - state.vx) * damping;
    state.vy += (state.targetVy - state.vy) * damping;
    state.vz += (state.targetVz - state.vz) * damping;

    // 摩擦
    if (Math.abs(state.vx) > Math.abs(state.targetVx) * 1.5) {
      state.vx *= friction;
    }
    if (Math.abs(state.vy) > Math.abs(state.targetVy) * 1.5) {
      state.vy *= friction;
    }
    if (Math.abs(state.vz) > Math.abs(state.targetVz) * 1.5) {
      state.vz *= friction;
    }

    // 更新旋转
    state.rotation.x += state.rotateX;
    state.rotation.y += state.rotateY;
    state.rotation.z += state.rotateZ;

    // 波纹效果
    state.time += state.rippleSpeed;
    const ripple = Math.sin(state.time + state.ripplePhase) * state.rippleScale + 1;

    // 更新矩阵
    const matrix = new THREE.Matrix4();
    matrix.compose(
      state.position,
      new THREE.Quaternion().setFromEuler(state.rotation),
      new THREE.Vector3(ripple, ripple, ripple)
    );
    matrix.toArray(matrices, i * 16);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;
};

// 更新星星
const updateStars = () => {
  if (!starPoints || !starPoints.geometry) return;

  const positions = starPoints.geometry.attributes.position.array as Float32Array;
  const opacities = starPoints.geometry.attributes.opacity.array as Float32Array;
  const time = Date.now() * 0.001;

  starStates.forEach((star, i) => {
    // 更新位置
    star.x += star.vx;
    star.y += star.vy;
    star.z += star.vz;

    // 边界检测
    if (star.x > 4 || star.x < -4) star.vx *= -1;
    if (star.y > 3 || star.y < -3) star.vy *= -1;
    if (star.z > 4 || star.z < 0.5) star.vz *= -1;

    // 更新缓冲区
    positions[i * 3] = star.x;
    positions[i * 3 + 1] = star.y;
    positions[i * 3 + 2] = star.z;

    // 更新透明度（闪烁效果在着色器中处理）
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    opacities[i] = Math.max(0.2, Math.min(0.9, star.baseOpacity + twinkle * 0.3));
  });

  starPoints.geometry.attributes.position.needsUpdate = true;
  starPoints.geometry.attributes.opacity.needsUpdate = true;

  // 更新着色器时间
  if (starPoints.material instanceof THREE.ShaderMaterial) {
    starPoints.material.uniforms.time.value = time;
  }
};

const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!camera || !containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersectPoint);

  if (intersectPoint) {
    mouseX = intersectPoint.x;
    mouseY = intersectPoint.y;
    mouseZ = intersectPoint.z;
    hasMouse = true;
  }
};

// 处理鼠标离开
const handleMouseLeave = () => {
  hasMouse = false;
};

// 处理点击事件：弹飞附近的粒子
const handleClick = (event: MouseEvent) => {
  if (!camera || !containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersectPoint);

  if (!intersectPoint) return;

  // 优化：直接操作粒子状态数组
  particleStates.forEach(state => {
    const dx = state.position.x - intersectPoint.x;
    const dy = state.position.y - intersectPoint.y;
    const dz = state.position.z - intersectPoint.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 4 && distance > 0) {
      const force = ((4 - distance) / 4) * 0.04;
      state.vx += (dx / distance) * force;
      state.vy += (dy / distance) * force;
      state.vz += (dz / distance) * force;

      state.targetVx = state.vx;
      state.targetVy = state.vy;
      state.targetVz = state.vz;
    }
  });
};

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('click', handleClick);
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);

  // 优化：正确清理资源
  if (renderer) {
    renderer.dispose();
    if (containerRef.value && renderer.domElement) {
      containerRef.value.removeChild(renderer.domElement);
    }
  }

  // 清理几何体和材质
  if (instancedMesh) {
    instancedMesh.geometry.dispose();
    (instancedMesh.material as THREE.Material).dispose();
  }

  if (starPoints) {
    starPoints.geometry.dispose();
    (starPoints.material as THREE.Material).dispose();
  }

  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseleave', handleMouseLeave);
  window.removeEventListener('click', handleClick);
});
</script>

<style scoped>
.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
