<template>
  <div class="particle-animation">
    <div ref="container" class="animation-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, watch } from 'vue';
import {
  initThreeScene,
  cleanUpThree,
  createParticleSystem,
  startColorfulParticleAnimation,
  validateParticleCount,
  validateColor,
  validateParticleShape,
} from './utils';
import * as THREE from 'three';
import type { ParticleAnimationProps } from './types';
import { DEFAULT_VALUES } from './constants';

// 定义组件属性
const props = withDefaults(defineProps<ParticleAnimationProps>(), {
  particleCount: DEFAULT_VALUES.PARTICLE_COUNT,
  backgroundColor: DEFAULT_VALUES.BACKGROUND_COLOR,
  particleShape: DEFAULT_VALUES.PARTICLE_SHAPE,
});

// 组件引用
const container = ref<HTMLDivElement | null>(null);

// Three.js 相关变量
let sceneObj: any = null;
let particleSystem: THREE.Points | null = null;

// 错误处理函数
const handleError = (error: string) => {
  console.error('Particle Animation Error:', error);
};

// 初始化动画
const initAnimation = () => {
  // 清理之前的动画
  if (sceneObj) {
    cleanUpThree(sceneObj.renderer, sceneObj.animationId);
    sceneObj = null;
    particleSystem = null;
  }

  if (!container.value) {
    handleError('Container element not found');
    return;
  }

  try {
    // 验证参数
    if (props.particleCount) {
      validateParticleCount(props.particleCount);
    }

    if (props.backgroundColor) {
      validateColor(props.backgroundColor);
    }

    if (props.particleShape) {
      validateParticleShape(props.particleShape);
    }

    // 初始化 Three.js 场景
    sceneObj = initThreeScene(container.value);

    // 设置背景颜色
    if (props.backgroundColor === 'transparent') {
      sceneObj.scene.background = null;
    } else if (props.backgroundColor) {
      sceneObj.scene.background = new THREE.Color(props.backgroundColor);
    }

    // 创建粒子系统
    const count = props.particleCount;
    const shape = props.particleShape;
    particleSystem = createParticleSystem(sceneObj.scene, count, shape);

    // 开始粒子动画
    if (particleSystem) {
      sceneObj.animationId = startColorfulParticleAnimation(
        sceneObj.scene,
        sceneObj.camera,
        sceneObj.renderer,
        particleSystem
      );
    }
  } catch (error) {
    handleError((error as Error).message);
  }
};

// 监听属性变化
watch(
  () => [props.particleCount, props.backgroundColor, props.particleShape],
  () => {
    initAnimation();
  },
  { deep: true }
);

// 组件挂载时初始化动画
onMounted(() => {
  initAnimation();
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (sceneObj) {
    cleanUpThree(sceneObj.renderer, sceneObj.animationId);
  }
});
</script>

<style scoped>
.particle-animation {
  position: relative;
  width: 100%;
  height: 100%;
}

.animation-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
