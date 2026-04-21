# ParticleAnimation 组件

一个基于 Three.js 的粒子动画背景组件，支持自定义粒子数量、形状和背景颜色。

## 功能特性

- ✅ 支持三种粒子形状：六边形、三角形、爱心
- ✅ 可自定义粒子数量（100-10000）
- ✅ 支持自定义背景颜色（hex、rgb、rgba 格式）
- ✅ 响应式设计，自适应容器大小
- ✅ 平滑的粒子动画效果
- ✅ 完善的错误处理

## 安装

将组件复制到项目的 `src/components` 目录下即可。

## 使用方法

### 基本用法

```vue
<template>
  <div class="page">
    <ParticleAnimation 
      particle-count="2000"
      background-color="transparent"
      particle-shape="hexagon"
    />
    <div class="content">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import ParticleAnimation from '@/components/ParticleAnimation';
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #303243;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.particle-animation) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 10;
  /* 其他样式 */
}
</style>
```

### 在 401 页面中使用

```vue
<template>
  <div class="error-page error-401">
    <ParticleAnimation 
      particle-count="2500"
      background-color="transparent"
      particle-shape="hexagon"
    />
    <div class="error-content">
      <h1 class="error-code">401</h1>
      <h2 class="error-title">Unauthorized Access</h2>
      <p class="error-description">
        You are not authorized to access this resource. Please login with valid credentials.
      </p>
      <div class="buttons">
        <el-button type="primary" @click="goBack" class="back-button">Go Back</el-button>
        <el-button type="primary" @click="goLogin" class="login-button">Go to Login</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ParticleAnimation from '../components/ParticleAnimation';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.error-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #304156;
  position: relative;
  overflow: hidden;
}

:deep(.particle-animation) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

/* 其他样式 */
</style>
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `particle-count` | `number` | `2000` | 粒子数量，范围：100-10000 |
| `background-color` | `string` | `'transparent'` | 背景颜色，支持 hex、rgb、rgba 格式 |
| `particle-shape` | `'hexagon' \| 'triangle' \| 'heart'` | `'hexagon'` | 粒子形状 |

## 错误处理

当输入无效值时，组件会在控制台抛出明确的错误信息，例如：

- `Error: Particle count must be between 100 and 10000`
- `Error: Invalid color format. Please use hex (#RRGGBB), rgb(r, g, b), or rgba(r, g, b, a)`
- `Error: Invalid particle shape. Please use one of: hexagon, triangle, heart`

## 示例

### 示例 1：使用三角形粒子

```vue
<ParticleAnimation 
  particle-count="1500"
  background-color="#1a1a2e"
  particle-shape="triangle"
/>
```

### 示例 2：使用爱心粒子

```vue
<ParticleAnimation 
  particle-count="3000"
  background-color="rgba(255, 105, 180, 0.1)"
  particle-shape="heart"
/>
```

### 示例 3：使用自定义背景颜色

```vue
<ParticleAnimation 
  particle-count="2000"
  background-color="#304156"
  particle-shape="hexagon"
/>
```

## 技术实现

- **Three.js**：用于创建和渲染 3D 粒子系统
- **Vue 3 Composition API**：使用 setup 语法和响应式 API
- **TypeScript**：提供类型安全
- **Canvas API**：用于创建粒子纹理

## 性能优化

- 使用 `requestAnimationFrame` 进行高效的动画渲染
- 粒子位置计算优化，避免不必要的计算
- 资源清理，防止内存泄漏
- 响应式设计，自适应容器大小

## 注意事项

1. 粒子数量建议在 1000-5000 之间，过多的粒子可能会影响性能
2. 背景颜色使用 `transparent` 时，会继承父元素的背景颜色
3. 组件会自动处理窗口大小变化，无需手动调整
4. 组件卸载时会自动清理 Three.js 资源，避免内存泄漏

## 浏览器兼容性

支持所有现代浏览器，包括：
- Chrome
- Firefox
- Safari
- Edge

需要浏览器支持 WebGL。