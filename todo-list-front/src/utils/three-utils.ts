import * as THREE from 'three';

// Three.js 场景类型
export interface ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animationId: number | null;
}

// 初始化 Three.js 场景
export const initThreeScene = (container: HTMLDivElement): ThreeScene => {
  // 创建场景
  const scene = new THREE.Scene();

  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(400, 400);
  container.appendChild(renderer.domElement);

  return {
    scene,
    camera,
    renderer,
    animationId: null,
  };
};

// 创建宇航员模型
export const createAstronaut = (scene: THREE.Scene): THREE.Group => {
  // 创建宇航员组
  const astronaut = new THREE.Group();

  // 材质
  const astronautMaterial = new THREE.LineBasicMaterial({ color: 0x4caf50 }); // 绿色
  const planetMaterial = new THREE.LineBasicMaterial({ color: 0x2196f3 }); // 蓝色
  const starMaterial = new THREE.LineBasicMaterial({ color: 0xffc107 }); // 黄色

  // 头部
  const headGeometry = new THREE.CircleGeometry(1, 32);
  const head = new THREE.Line(headGeometry, astronautMaterial);
  astronaut.add(head);

  // 面罩
  const faceGeometry = new THREE.CircleGeometry(0.7, 32);
  const face = new THREE.Line(faceGeometry, astronautMaterial);
  face.position.z = 0.1;
  astronaut.add(face);

  // 身体
  const bodyGeometry = new THREE.CircleGeometry(1, 32);
  const body = new THREE.Line(bodyGeometry, astronautMaterial);
  body.position.y = -2;
  body.scale.set(0.8, 1.2, 1);
  astronaut.add(body);

  // 手臂
  const leftArmGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1, -0.5, 0),
  ]);
  const leftArm = new THREE.Line(leftArmGeometry, astronautMaterial);
  leftArm.position.set(0.8, -1.5, 0);
  leftArm.rotation.z = Math.PI / 4;
  astronaut.add(leftArm);

  const rightArmGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, -0.5, 0),
  ]);
  const rightArm = new THREE.Line(rightArmGeometry, astronautMaterial);
  rightArm.position.set(-0.8, -1.5, 0);
  rightArm.rotation.z = -Math.PI / 4;
  astronaut.add(rightArm);

  // 腿部
  const leftLegGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.5, -1.5, 0),
  ]);
  const leftLeg = new THREE.Line(leftLegGeometry, astronautMaterial);
  leftLeg.position.set(0.4, -3, 0);
  leftLeg.rotation.z = Math.PI / 6;
  astronaut.add(leftLeg);

  const rightLegGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, -1.5, 0),
  ]);
  const rightLeg = new THREE.Line(rightLegGeometry, astronautMaterial);
  rightLeg.position.set(-0.4, -3, 0);
  rightLeg.rotation.z = -Math.PI / 6;
  astronaut.add(rightLeg);

  // 天线
  const antennaGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.5, 0),
  ]);
  const antenna = new THREE.Line(antennaGeometry, astronautMaterial);
  antenna.position.y = 1.2;
  astronaut.add(antenna);

  // 天线球
  const antennaBallGeometry = new THREE.CircleGeometry(0.1, 16);
  const antennaBall = new THREE.Line(antennaBallGeometry, astronautMaterial);
  antennaBall.position.y = 0.55;
  astronaut.add(antennaBall);

  // 星星
  for (let i = 0; i < 20; i++) {
    const starGeometry = new THREE.CircleGeometry(0.05, 4);
    const star = new THREE.Line(starGeometry, starMaterial);
    star.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -1);
    scene.add(star);
  }

  // 行星
  const planetGeometry = new THREE.CircleGeometry(1.5, 32);
  const planet = new THREE.Line(planetGeometry, planetMaterial);
  planet.position.set(5, 3, -2);
  scene.add(planet);

  // 行星环
  const ringGeometry = new THREE.CircleGeometry(2.5, 32);
  const ring = new THREE.Line(ringGeometry, planetMaterial);
  ring.position.set(5, 3, -2);
  ring.scale.set(1, 0.2, 1);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // 弧线
  const curveGeometry = new THREE.BufferGeometry();
  const curvePoints = [];
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI;
    curvePoints.push(new THREE.Vector3(Math.cos(angle) * 4 - 5, Math.sin(angle) * 2 - 3, -1));
  }
  curveGeometry.setFromPoints(curvePoints);
  const curve = new THREE.Line(curveGeometry, astronautMaterial);
  scene.add(curve);

  // 添加到场景
  scene.add(astronaut);

  return astronaut;
};

// 创建3D文字
export const create3DText = (
  scene: THREE.Scene,
  text: string,
  options?: {
    size?: number;
    height?: number;
    position?: THREE.Vector3;
    color?: number;
  }
): THREE.Group => {
  const { size = 1, height = 0.2, position = new THREE.Vector3(0, 0, 0), color = 0x333333 } = options || {};

  // 创建文字组
  const textGroup = new THREE.Group();
  textGroup.position.copy(position);

  // 由于Three.js默认不支持3D文字，我们使用几何体组合来模拟
  // 这里使用立方体来创建数字
  const createDigit = (digit: string, x: number) => {
    const digitGroup = new THREE.Group();
    digitGroup.position.x = x;

    const material = new THREE.MeshBasicMaterial({ color, wireframe: true });

    switch (digit) {
      case '0': {
        // 0
        const cylinder0 = new THREE.CylinderGeometry(size, size, height, 32);
        const mesh0 = new THREE.Mesh(cylinder0, material);
        digitGroup.add(mesh0);
        break;
      }
      case '3': {
        // 3
        const box3_1 = new THREE.BoxGeometry(size, height, size);
        const mesh3_1 = new THREE.Mesh(box3_1, material);
        mesh3_1.position.y = size / 2;
        digitGroup.add(mesh3_1);

        const box3_2 = new THREE.BoxGeometry(size, size, height);
        const mesh3_2 = new THREE.Mesh(box3_2, material);
        mesh3_2.position.set(0, 0, size / 2);
        digitGroup.add(mesh3_2);

        const box3_3 = new THREE.BoxGeometry(size, height, size);
        const mesh3_3 = new THREE.Mesh(box3_3, material);
        mesh3_3.position.y = -size / 2;
        digitGroup.add(mesh3_3);
        break;
      }
      case '4': {
        // 4
        const box4_1 = new THREE.BoxGeometry(height, size, size);
        const mesh4_1 = new THREE.Mesh(box4_1, material);
        mesh4_1.position.set(-size / 2, size / 2, 0);
        digitGroup.add(mesh4_1);

        const box4_2 = new THREE.BoxGeometry(size, height, size);
        const mesh4_2 = new THREE.Mesh(box4_2, material);
        mesh4_2.position.y = 0;
        digitGroup.add(mesh4_2);

        const box4_3 = new THREE.BoxGeometry(height, size, size);
        const mesh4_3 = new THREE.Mesh(box4_3, material);
        mesh4_3.position.set(size / 2, -size / 2, 0);
        digitGroup.add(mesh4_3);
        break;
      }
      default:
        break;
    }

    return digitGroup;
  };

  // 创建每个数字
  const digitWidth = size + 0.5;
  for (let i = 0; i < text.length; i++) {
    const digit = text[i];
    const x = (i - (text.length - 1) / 2) * digitWidth;
    const digitGroup = createDigit(digit, x);
    textGroup.add(digitGroup);
  }

  // 添加到场景
  scene.add(textGroup);

  return textGroup;
};

// 为3D对象添加上下浮动动画
export const addFloatAnimation = (object: THREE.Object3D, amplitude: number = 0.2, speed: number = 0.01) => {
  let time = 0;

  return () => {
    time += speed;
    object.position.y = Math.sin(time) * amplitude;
  };
};

// 创建六边形
export const createHexagon = (
  scene: THREE.Scene,
  size: number,
  position: THREE.Vector3,
  color: number,
  index: number
): THREE.Line => {
  // 创建空心六边形 - 只有边框，没有中心填充
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * size, Math.sin(angle) * size, 0));
  }
  points.push(points[0]); // 闭合路径

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    linewidth: 2,
  });
  const hexagon = new THREE.Line(geometry, material);
  hexagon.position.copy(position);

  // 添加自定义属性用于动画
  (hexagon as any).originalY = position.y;
  (hexagon as any).index = index;

  scene.add(hexagon);
  return hexagon;
};

// 开始动画
export const startAnimation = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): number => {
  let animationId: number;

  const animate = () => {
    // 旋转宇航员
    scene.traverse(object => {
      if (object instanceof THREE.Group) {
        object.rotation.y += 0.01;
      }
    });

    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);
  return animationId;
};

// 开始六边形浮动动画
export const startHexagonFloatAnimation = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  hexagons: THREE.Line[]
): number => {
  let animationId: number;

  const animate = () => {
    // 上下浮动六边形
    const time = Date.now() * 0.001; // 时间基准
    hexagons.forEach((hexagon, index) => {
      const originalY = (hexagon as any).originalY;
      const floatOffset = Math.sin(time * 0.5 + index) * 0.2; // 每个六边形有不同的相位
      hexagon.position.y = originalY + floatOffset;
    });

    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);
  return animationId;
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
