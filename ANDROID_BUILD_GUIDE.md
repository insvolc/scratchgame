# Android APK 构建指南

本项目使用 Capacitor 将 Vue 3 + Vite Web 应用打包为 Android APK，未修改原有业务代码。

---

## 环境要求

- Node.js（项目已配置）
- Android SDK：`E:\Android\Sdk`
- JDK 21：`C:\Users\ROG\.jdks\jdk-21`

> 说明：Capacitor 8.x 要求 JDK 21，本机原有的 JDK 18 和 JetBrains JBR 精简版均无法完成编译，因此单独下载了完整版 OpenJDK 21。

---

## 快速重新构建 Debug APK

在 PowerShell 中依次执行：

```powershell
# 设置环境变量
$env:JAVA_HOME = 'C:\Users\ROG\.jdks\jdk-21'
$env:ANDROID_HOME = 'E:\Android\Sdk'
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# 构建 Web 产物（绕过 vue-tsc 版本兼容问题）
npx vite build

# 同步 Web 资源到 Android 工程
npx cap sync android

# 构建 Debug APK
cd android
.\gradlew assembleDebug
```

构建成功后，APK 位于：

```
E:\aiproject\scratchgame\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 构建 Release APK

如需发布，使用 release 构建：

```powershell
$env:JAVA_HOME = 'C:\Users\ROG\.jdks\jdk-21'
$env:ANDROID_HOME = 'E:\Android\Sdk'
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
cd android
.\gradlew assembleRelease
```

> Release 包需要配置签名密钥，未配置时会使用默认 debug 签名，不能用于应用商店发布。

---

## 项目改动说明

以下内容为打包新增，未修改 `src/` 业务代码：

| 文件/目录 | 说明 |
|-----------|------|
| `capacitor.config.ts` | Capacitor 初始化配置 |
| `android/` | Android 原生工程 |
| `package.json` / `package-lock.json` | 新增 `@capacitor/core`、`@capacitor/cli`、`@capacitor/android` 依赖 |
| `android/gradle/wrapper/gradle-wrapper.properties` | 使用腾讯云镜像下载 Gradle，解决官方源超时问题 |
| `C:\Users\ROG\.jdks\jdk-21` | 完整版 OpenJDK 21 |

---

## 常见问题

### 1. `vue-tsc` 报错 `Search string not found`

项目 `package.json` 中的 `npm run build` 会先执行 `vue-tsc`，当前 `vue-tsc` 版本与 TypeScript 版本存在兼容问题。构建 APK 时直接使用 `npx vite build` 即可。

### 2. Gradle 下载超时

已将 Gradle 分发地址改为腾讯云镜像：

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.14.3-all.zip
```

如需恢复官方源，改回：

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-all.zip
```

### 3. `JAVA_HOME` 或 `ANDROID_HOME` 未设置

确保每次构建前设置好这两个环境变量。也可以将它们添加到系统环境变量中，避免每次手动设置。

---

## 参考

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android Gradle 插件兼容性](https://developer.android.com/studio/releases/gradle-plugin#compatibility)
