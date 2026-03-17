# Vue3 管理平台

基于 Vue3 + Element Plus + Axios + Pinia + Vue Router + Mock 搭建的企业级管理平台

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP 请求库
- **Pinia** - Vue 状态管理
- **Vue Router** - Vue 官方路由
- **Vite** - 下一代前端构建工具

## 功能特性

### 1. 动态菜单
- 根据后端数据动态生成菜单
- 支持多级菜单嵌套
- 自动转换后端数据为路由格式

### 2. 权限管理

#### 菜单权限
- 根据角色显示不同的菜单
- 支持多角色组合
- 无权限菜单自动隐藏

#### 操作权限
- **指令式权限**: `v-permission` 指令
- **函数式权限**: `usePermission()` 组合式函数
- **组件式权限**: `<permission-button>` 组件

### 3. 组件开发
- **MenuTree** - 动态菜单组件
- **Breadcrumb** - 面包屑导航
- **PermissionButton** - 权限按钮组件
- **Hamburger** - 侧边栏折叠按钮

## 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
│   ├── Breadcrumb/   # 面包屑
│   ├── MenuTree/     # 菜单树
│   └── PermissionButton/  # 权限按钮
├── composables/      # 组合式函数
│   └── usePermission.js  # 权限检查
├── directive/        # 自定义指令
│   └── permission.js # 权限指令
├── layout/           # 布局组件
│   ├── components/
│   │   ├── AppMain.vue
│   │   ├── Header/
│   │   └── Sidebar/
│   └── index.vue
├── mock/             # Mock 数据
├── router/           # 路由配置
│   ├── constantRoutes.js
│   ├── asyncRoutes.js
│   └── index.js
├── store/            # Pinia 状态管理
│   ├── user.js
│   └── permission.js
├── utils/            # 工具函数
│   └── request.js    # Axios 封装
├── views/            # 页面视图
│   ├── dashboard/
│   ├── error/
│   ├── login/
│   ├── business/
│   ├── system/
│   └── statistics/
├── App.vue
└── main.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 权限使用说明

### 1. 指令式权限

```vue
<!-- 单个权限 -->
<el-button v-permission="'system:user:add'">新增</el-button>

<!-- 多个权限（满足其中一个） -->
<el-button v-permission="['system:user:add', 'system:user:edit']">操作</el-button>
```

### 2. 函数式权限

```vue
<script setup>
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasRole } = usePermission()

// 检查权限
if (hasPermission('system:user:add')) {
  // 有权限
}

// 检查角色
if (hasRole('admin')) {
  // 是管理员
}
</script>
```

### 3. 组件式权限

```vue
<!-- 单个权限 -->
<permission-button permission="system:user:add" type="primary">
  新增
</permission-button>

<!-- 多个权限 -->
<permission-button :permission="['system:user:edit', 'system:user:delete']">
  操作
</permission-button>
```

### 4. 角色指令

```vue
<!-- 检查角色 -->
<div v-role="'admin'">仅管理员可见</div>

<!-- 多个角色 -->
<div v-role="['admin', 'editor']">管理员或编辑可见</div>
```

## Mock 数据

测试账号：
- **管理员**: admin / 123456
- **普通用户**: user / 123456

## 权限标识说明

权限标识格式：`模块:资源:操作`

- `system:user:view` - 查看用户
- `system:user:add` - 新增用户
- `system:user:edit` - 编辑用户
- `system:user:delete` - 删除用户
- `*:*:*` - 超级权限（所有权限）

## 路由配置

路由分为两种：
- **constantRoutes** - 静态路由（登录页、404等）
- **asyncRoutes** - 动态路由（根据权限生成）

动态路由通过后端接口返回菜单数据，自动转换为路由格式并添加到路由表。
