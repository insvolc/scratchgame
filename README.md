# 幸运刮刮乐游戏

## 项目简介

基于 Vue 3 + TypeScript + Vite 构建的幸运刮刮乐游戏。

## 技术栈

- **框架**: Vue 3
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: SCSS

## 运行指令

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认端口为 5173，如果端口被占用会自动切换到其他端口（如 5174）。

开发服务器启动后访问: http://localhost:5173/

### 构建生产版本

```bash
npm run build
```

构建产物会输出到 `dist` 目录。

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
├── src/
│   ├── components/          # UI 组件
│   │   ├── BackpackPage.vue # 背包页面
│   │   ├── HomePage.vue     # 首页
│   │   ├── ScratchCanvas.vue # 刮奖画布组件
│   │   ├── ScratchPage.vue  # 刮奖页面
│   │   └── ShopPage.vue     # 商店页面
│   ├── stores/              # 状态管理
│   │   └── game.ts          # 游戏状态
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 游戏玩法

1. 在首页选择刮奖类型
2. 使用鼠标或手指刮开涂层
3. 匹配中奖号码获得奖励
4. 点击中奖号码领取金币