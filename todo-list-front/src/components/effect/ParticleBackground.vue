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

// 是否有鼠标移动
let hasMouse = false;

const starCount = 200; // 增加星星数量

// 星星数组
interface Star {
  mesh: THREE.Mesh;
  twinkleSpeed: number;
  twinkleOffset: number;
  baseOpacity: number;
  vx: number; // x方向速度
  vy: number; // y方向速度
  vz: number; // z方向速度
}

const stars: Star[] = [];

// 创建简单的五角星几何体
const createStarGeometry = (size: number): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];

  const outerRadius = size;
  const innerRadius = size * 0.45;

  // 创建五角星的10个顶点
  for (let i = 0; i < 5; i++) {
    const angle1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const angle2 = angle1 + Math.PI / 5;

    // 外顶点
    const x1 = Math.cos(angle1) * outerRadius;
    const y1 = Math.sin(angle1) * outerRadius;
    vertices.push(x1, y1, 0);

    // 内顶点
    const x2 = Math.cos(angle2) * innerRadius;
    const y2 = Math.sin(angle2) * innerRadius;
    vertices.push(x2, y2, 0);
  }

  // 五角星的面（5个三角形）
  const faces = [
    [0, 1, 3],
    [0, 3, 2],
    [2, 3, 5],
    [2, 5, 4],
    [4, 5, 7],
    [4, 7, 6],
    [6, 7, 9],
    [6, 9, 8],
    [8, 9, 1],
    [8, 1, 0],
  ];

  faces.forEach(f => indices.push(f[0], f[1], f[2]));

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
};

// 创建星星
const createStars = () => {
  if (!scene) return;

  for (let i = 0; i < starCount; i++) {
    // 创建星星几何体（五角星）
    const size = 0.03 + Math.random() * 0.04;
    const geometry = createStarGeometry(size);

    // 创建自发光材质（不需要光照）
    const colorChoice = Math.random();
    let color: number;
    if (colorChoice < 0.6) {
      color = 0xffffff; // 白色
    } else if (colorChoice < 0.85) {
      color = 0xa0a0ff; // 淡蓝色
    } else {
      color = 0xfff0a0; // 淡黄色
    }

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    const star = new THREE.Mesh(geometry, material);

    // 设置随机位置
    star.position.x = (Math.random() - 0.5) * 8;
    star.position.y = (Math.random() - 0.5) * 6;
    star.position.z = 0.5 + Math.random() * 4;

    // 设置随机旋转
    star.rotation.x = Math.random() * Math.PI * 2;
    star.rotation.y = Math.random() * Math.PI * 2;

    scene.add(star);

    // 随机移动速度（非常缓慢）
    const speed = 0.001 + Math.random() * 0.002;
    const angle = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;

    stars.push({
      mesh: star,
      twinkleSpeed: 1.5 + Math.random() * 2.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.3 + Math.random() * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: Math.sin(angle2) * speed * 0.5,
    });
  }
};

// 更新星星动画
const updateStars = () => {
  const time = Date.now() * 0.001;

  stars.forEach(star => {
    const material = star.mesh.material as THREE.MeshBasicMaterial;

    // 柔和闪烁效果
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    const opacity = star.baseOpacity + twinkle * 0.3;

    material.opacity = Math.max(0.2, Math.min(0.9, opacity));

    // 缓慢移动星星
    star.mesh.position.x += star.vx;
    star.mesh.position.y += star.vy;
    star.mesh.position.z += star.vz;

    // 边界检测，超出边界时反弹
    const boundX = 4;
    const boundY = 3;
    const boundZ = 4;

    if (star.mesh.position.x > boundX || star.mesh.position.x < -boundX) {
      star.vx *= -1;
    }
    if (star.mesh.position.y > boundY || star.mesh.position.y < -boundY) {
      star.vy *= -1;
    }
    if (star.mesh.position.z > boundZ || star.mesh.position.z < 0.5) {
      star.vz *= -1;
    }
  });
};

// 创建3D爱心几何体
const createHeartGeometry = (size: number): THREE.BufferGeometry => {
  // 3D爱心顶点
  const vertices: number[] = [];
  const faces: number[] = [];

  // 缩放因子
  const scale = size / 4;

  // 爱心顶点（简化版3D爱心）
  const heartVertices = [
    [0, 1, 0], // 顶部
    [-1, 0.5, 0], // 左上
    [1, 0.5, 0], // 右上
    [-0.8, -0.3, 0], // 左下
    [0.8, -0.3, 0], // 右下
    [0, -1, 0], // 底部
    [0, 0.8, 0.3], // 前顶
    [0, 0.8, -0.3], // 后顶
    [-0.5, 0.2, 0.2], // 左前
    [0.5, 0.2, 0.2], // 右前
    [-0.5, 0.2, -0.2], // 左后
    [0.5, 0.2, -0.2], // 右后
    [0, -0.5, 0.2], // 底前
    [0, -0.5, -0.2], // 底后
  ];

  // 添加顶点
  heartVertices.forEach(v => {
    vertices.push(v[0] * scale, v[1] * scale, v[2] * scale);
  });

  // 添加面（简化版）
  const heartFaces = [
    // 前面
    [0, 1, 4],
    [0, 4, 2],
    [1, 5, 4],
    [4, 5, 3],
    // 后面
    [0, 2, 11],
    [0, 11, 6],
    [2, 10, 11],
    [11, 10, 6],
    // 左面
    [0, 6, 9],
    [0, 9, 1],
    [6, 7, 9],
    [9, 7, 8],
    // 右面
    [0, 3, 8],
    [0, 8, 7],
    [3, 5, 8],
    [8, 5, 12],
    // 顶面
    [6, 7, 1],
    [7, 10, 1],
    [7, 11, 10],
    [6, 1, 9],
    // 底面
    [3, 5, 12],
    [5, 4, 13],
    [4, 12, 13],
    [3, 12, 13],
  ];

  // 添加面
  heartFaces.forEach(f => {
    faces.push(f[0], f[1], f[2]);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();

  return geometry;
};

const init = () => {
  if (!containerRef.value) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 创建场景
  scene = new THREE.Scene();

  // 添加点光源
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 10);
  scene.add(pointLight);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // 完全透明背景
  containerRef.value.appendChild(renderer.domElement);

  // 创建银河星星
  createStars();

  // 创建粒子组
  const particleCount = 600;
  const shapes = ['sphere', 'cube', 'cone', 'octahedron', 'torus', 'tetrahedron', 'heart'];

  for (let i = 0; i < particleCount; i++) {
    // 随机位置
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;

    // 随机大小（0.02-0.06）
    const size = 0.02 + Math.random() * 0.04;

    // 随机形状
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // 创建几何体（全部使用3D形状）
    let geometry: THREE.BufferGeometry;
    switch (shape) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(size, 16, 16);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(size, size * 2, 8);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(size);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(size, size * 0.3, 8, 16);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(size);
        break;
      case 'heart':
        geometry = createHeartGeometry(size);
        break;
      default:
        geometry = new THREE.SphereGeometry(size, 16, 16);
    }

    // 随机深色（调整颜色深度）
    const r = 0.3 + Math.random() * 0.35;
    const g = 0.3 + Math.random() * 0.35;
    const b = 0.4 + Math.random() * 0.4;

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.5 + Math.random() * 0.35, // 适度的透明度
      side: THREE.DoubleSide,
    });

    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(x, y, z);
    // 基础速度
    const baseSpeed = 0.003;
    const vx = (Math.random() - 0.5) * baseSpeed * 2;
    const vy = (Math.random() - 0.5) * baseSpeed * 2;
    const vz = (Math.random() - 0.5) * baseSpeed * 2;

    // 水波纹效果参数
    const ripplePhase = Math.random() * Math.PI * 2; // 波纹相位
    const rippleSpeed = 0.02 + Math.random() * 0.02; // 波纹速度
    const rippleScale = 0.2 + Math.random() * 0.2; // 波纹幅度

    particle.userData = {
      vx: vx,
      vy: vy,
      vz: vz,
      targetVx: vx, // 目标匀速
      targetVy: vy,
      targetVz: vz,
      rotateX: (Math.random() - 0.5) * 0.02,
      rotateY: (Math.random() - 0.5) * 0.02,
      rotateZ: (Math.random() - 0.5) * 0.02,
      radius: size * 0.8, // 碰撞半径
      baseScale: 1, // 基础缩放
      ripplePhase: ripplePhase, // 波纹相位
      rippleSpeed: rippleSpeed, // 波纹速度
      rippleScale: rippleScale, // 波纹幅度
      time: 0, // 时间计数器
    };
    scene.add(particle);
  }

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    // 每个粒子独立运动
    if (!scene) return;
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.userData.vx !== undefined) {
        // 鼠标吸附效果
        if (hasMouse) {
          const dx = mouseX - child.position.x;
          const dy = mouseY - child.position.y;
          const dz = mouseZ - child.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // 距离小于3时产生吸附力（较弱的吸附，避免过度聚拢）
          if (distance < 3 && distance > 0.5) {
            const force = ((3 - distance) / 3) * 0.015;
            child.position.x += dx * force;
            child.position.y += dy * force;
            child.position.z += dz * force;
          }
        }

        // 位置移动
        child.position.x += child.userData.vx;
        child.position.y += child.userData.vy;
        child.position.z += child.userData.vz;

        // 边界检测
        const bound = 5;
        if (Math.abs(child.position.x) > bound) {
          child.userData.vx *= -1;
          child.userData.targetVx *= -1;
        }
        if (Math.abs(child.position.y) > bound) {
          child.userData.vy *= -1;
          child.userData.targetVy *= -1;
        }
        if (Math.abs(child.position.z) > bound) {
          child.userData.vz *= -1;
          child.userData.targetVz *= -1;
        }

        // 阻尼效果：速度慢慢恢复到匀速（增强阻尼，使弹飞后更快减速）
        const damping = 0.08; // 阻尼系数（增大到0.08）
        child.userData.vx += (child.userData.targetVx - child.userData.vx) * damping;
        child.userData.vy += (child.userData.targetVy - child.userData.vy) * damping;
        child.userData.vz += (child.userData.targetVz - child.userData.vz) * damping;

        // 额外的速度衰减：弹飞后速度逐渐变慢
        const friction = 0.98; // 摩擦系数
        if (Math.abs(child.userData.vx) > Math.abs(child.userData.targetVx) * 1.5) {
          child.userData.vx *= friction;
        }
        if (Math.abs(child.userData.vy) > Math.abs(child.userData.targetVy) * 1.5) {
          child.userData.vy *= friction;
        }
        if (Math.abs(child.userData.vz) > Math.abs(child.userData.targetVz) * 1.5) {
          child.userData.vz *= friction;
        }

        // 旋转
        child.rotation.x += child.userData.rotateX;
        child.rotation.y += child.userData.rotateY;
        child.rotation.z += child.userData.rotateZ;

        // 水波纹效果：周期性缩放
        child.userData.time += child.userData.rippleSpeed;
        const ripple = Math.sin(child.userData.time + child.userData.ripplePhase) * child.userData.rippleScale + 1;
        child.scale.set(ripple, ripple, ripple);
      }
    });

    // 粒子碰撞检测
    const particles = scene.children.filter(
      (c): c is THREE.Mesh => c instanceof THREE.Mesh && c.userData.vx !== undefined
    );

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const dz = p2.position.z - p1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const minDistance = p1.userData.radius + p2.userData.radius;

        if (distance < minDistance && distance > 0) {
          // 碰撞发生，计算反弹
          const nx = dx / distance;
          const ny = dy / distance;
          const nz = dz / distance;

          // 相对速度
          const dvx = p1.userData.vx - p2.userData.vx;
          const dvy = p1.userData.vy - p2.userData.vy;
          const dvz = p1.userData.vz - p2.userData.vz;

          // 相对速度在法线方向的分量
          const vn = dvx * nx + dvy * ny + dvz * nz;

          // 如果粒子正在靠近，才反弹
          if (vn < 0) {
            // 弹性碰撞（降低弹性系数，使反弹更柔和）
            const restitution = 0.3; // 弹性系数（降低到0.3）
            const impulse = -(1 + restitution) * vn * 0.5; // 减少冲量

            // 更新速度
            p1.userData.vx += impulse * nx;
            p1.userData.vy += impulse * ny;
            p1.userData.vz += impulse * nz;

            p2.userData.vx -= impulse * nx;
            p2.userData.vy -= impulse * ny;
            p2.userData.vz -= impulse * nz;

            // 限制最大速度
            const maxSpeed = 0.008;
            const speed1 = Math.sqrt(p1.userData.vx ** 2 + p1.userData.vy ** 2 + p1.userData.vz ** 2);
            if (speed1 > maxSpeed) {
              const scale = maxSpeed / speed1;
              p1.userData.vx *= scale;
              p1.userData.vy *= scale;
              p1.userData.vz *= scale;
            }
            const speed2 = Math.sqrt(p2.userData.vx ** 2 + p2.userData.vy ** 2 + p2.userData.vz ** 2);
            if (speed2 > maxSpeed) {
              const scale = maxSpeed / speed2;
              p2.userData.vx *= scale;
              p2.userData.vy *= scale;
              p2.userData.vz *= scale;
            }

            // 分离粒子
            const overlap = minDistance - distance;
            p1.position.x -= (nx * overlap) / 2;
            p1.position.y -= (ny * overlap) / 2;
            p1.position.z -= (nz * overlap) / 2;

            p2.position.x += (nx * overlap) / 2;
            p2.position.y += (ny * overlap) / 2;
            p2.position.z += (nz * overlap) / 2;
          }
        }
      }
    }

    // 更新星星动画
    updateStars();

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
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

  // 将鼠标位置转换为3D坐标
  const rect = containerRef.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // 创建射线
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  // 获取射线与z=0平面的交点
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
  if (!camera || !scene || !containerRef.value) return;

  // 将点击位置转换为3D坐标
  const rect = containerRef.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersectPoint);

  if (!intersectPoint) return;

  // 弹飞附近的粒子
  const particles = scene.children.filter(
    (c): c is THREE.Mesh => c instanceof THREE.Mesh && c.userData.vx !== undefined
  );

  particles.forEach(particle => {
    const dx = particle.position.x - intersectPoint.x;
    const dy = particle.position.y - intersectPoint.y;
    const dz = particle.position.z - intersectPoint.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 距离小于4的粒子被弹飞
    if (distance < 4 && distance > 0) {
      const force = ((4 - distance) / 4) * 0.05;
      particle.userData.vx += (dx / distance) * force;
      particle.userData.vy += (dy / distance) * force;
      particle.userData.vz += (dz / distance) * force;

      // 更新目标速度
      particle.userData.targetVx = particle.userData.vx;
      particle.userData.targetVy = particle.userData.vy;
      particle.userData.targetVz = particle.userData.vz;
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
  if (renderer) renderer.dispose();
  if (containerRef.value && renderer?.domElement) {
    containerRef.value.removeChild(renderer.domElement);
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
