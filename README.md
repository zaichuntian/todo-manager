# Todo Manager 项目

一个基于 Vue 3 + TypeScript + Express + MySQL 的待办任务管理系统。

## 项目简介

本项目是一个完整的待办任务管理系统，包含用户管理和任务管理两大核心功能。系统采用前后端分离架构，前端使用 Vue 3 + TypeScript + Element Plus 构建，后端使用 Express + TypeScript + MySQL 实现。

## 技术栈

### 前端

- **框架**: Vue 3 + Composition API
- **语言**: TypeScript
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **动画**: GSAP, Three.js
- **构建工具**: Vite

### 后端

- **框架**: Express
- **语言**: TypeScript
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT
- **密码加密**: bcrypt

## 项目结构
todo-manager/ ├── todo-list-front/ # 前端项目 │ ├── src/ │ │ ├── api/ # API 调用 │ │ ├── assets/ # 静态资源 │ │ ├── components/ # 组件 │ │ ├── hooks/ # 自定义 Hooks │ │ ├── layouts/ # 布局组件 │ │ ├── router/ # 路由配置 │ │ ├── stores/ # 状态管理 │ │ ├── types/ # TypeScript 类型定义 │ │ ├── utils/ # 工具函数 │ │ ├── views/ # 页面组件 │ │ ├── App.vue # 根组件 │ │ └── main.ts # 入口文件 │ ├── index.html │ ├── package.json │ └── vite.config.ts ├── todo-list-backend/ # 后端项目 │ ├── src/ │ │ ├── config/ # 配置文件 │ │ ├── controllers/ # 控制器 │ │ ├── middlewares/ # 中间件 │ │ ├── models/ # 数据模型 │ │ ├── routes/ # 路由 │ │ ├── services/ # 业务逻辑 │ │ ├── types/ # TypeScript 类型定义 │ │ ├── utils/ # 工具函数 │ │ └── app.ts # 应用入口 │ ├── .env # 环境变量 │ ├── package.json │ └── tsconfig.json └── README.md # 项目说明

## 核心功能

### 1. 用户管理

- 用户列表展示
- 用户新增
- 用户编辑
- 用户删除
- 用户状态管理（启用/禁用）

### 2. 任务管理

- 任务列表展示
- 任务新增
- 任务编辑
- 任务删除
- 任务状态管理（完成/未完成）
- 任务权限控制（仅能操作自己的任务）

### 3. 系统功能

- 登录认证
- 路由导航
- 面包屑导航
- 页面切换动画
- 错误页面粒子动画效果
- 响应式布局

## 安装和运行

### 前置条件

- Node.js 16+
- MySQL 5.7+
- pnpm （推荐）

### 后端安装

1. 进入后端目录

```bash
cd todo-list-backend
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量
   编辑 `.env` 文件，设置数据库连接信息：

数据库配置
DB_HOST=localhost DB_PORT=3306 DB_NAME=todo_db DB_USER=root DB_PASSWORD=0000

服务配置
PORT=3001

JWT 配置
JWT_SECRET=your_jwt_secret_key


4. 启动服务

```bash
pnpm dev
```

### 前端安装

1. 进入前端目录

```bash
cd todo-list-front
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器

```bash
pnpm dev
```

4. 构建生产版本

```bash
pnpm build
```

## 项目特点

1. **TypeScript 支持**: 全项目使用 TypeScript，提供类型安全
2. **组件化开发**: 前端采用组件化开发，代码结构清晰
3. **自定义 Hooks**: 提取业务逻辑到自定义 Hooks，提高代码复用性
4. **响应式设计**: 适配不同屏幕尺寸
5. **动画效果**: 使用 GSAP 实现流畅的页面切换动画，使用 Three.js 实现错误页面粒子动画效果
6. **权限控制**: 实现了基本的权限控制逻辑
7. **环境配置**: 使用 .env 文件管理配置，方便部署

## 关键技术点

### 1. 自定义 Hooks

- **useCrud**: 通用 CRUD 操作 Hook，减少重复代码
- **useLayout**: 布局相关逻辑 Hook
- **useAnimation**: 动画相关逻辑 Hook
- **useTodo**: 任务管理 Hook
- **useUser**: 用户管理 Hook

### 2. 类型定义

- 统一的类型定义，确保类型安全
- 提取公共类型到 `types/common.ts`

### 3. 动画效果

- 使用 GSAP 实现页面切换动画
- 淡入淡出效果，提升用户体验
- 使用 Three.js 实现错误页面粒子动画效果，支持自定义粒子形状和数量

### 4. 权限控制

- 任务权限控制，仅能操作自己的任务
- 用户状态管理，禁用的用户无法登录

## 注意事项

1. **数据库配置**: 请确保 `.env` 文件中的数据库配置正确
2. **端口冲突**: 前端默认使用 5173 端口，后端默认使用 3001 端口，请确保这些端口未被占用
3. **CORS 配置**: 后端已配置 CORS，允许前端访问
4. **密码加密**: 用户密码使用 bcrypt 加密存储
5. **JWT 认证**: 使用 JWT 进行身份认证

## 开发规范

1. **代码风格**: 使用 ESLint 和 Prettier 保持代码风格一致
2. **提交规范**: 遵循 conventional commits 规范
3. **类型安全**: 尽量使用 TypeScript 类型，避免 any 类型
4. **代码复用**: 提取公共逻辑到 Hooks 或工具函数
5. **注释规范**: 关键代码添加注释，提高代码可读性

## 后续优化方向

1. **测试覆盖**: 添加单元测试和集成测试
2. **性能优化**: 优化页面加载速度和响应速度
3. **安全增强**: 增强系统安全性，防止常见安全漏洞
4. **功能扩展**: 添加更多功能，如任务分类、标签管理等
5. **部署优化**: 优化部署流程，支持容器化部署
6. **动画扩展**: 扩展粒子动画效果，支持更多页面和场景

## 许可证

MIT License