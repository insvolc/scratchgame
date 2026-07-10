$ErrorActionPreference = 'Stop'

# 设置 Android 构建环境变量
$env:JAVA_HOME = 'C:\Users\ROG\.jdks\jdk-21'
$env:ANDROID_HOME = 'E:\Android\Sdk'
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "Building web assets..."
npx vite build

Write-Host "Syncing web resources to Android..."
npx cap sync android

Write-Host "Building Debug APK..."
Set-Location android
.\gradlew assembleDebug
Set-Location ..

Write-Host "APK built successfully: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Green
