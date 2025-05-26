import {
  ConfigPlugin,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
  withProjectBuildGradle,
  withSettingsGradle,
} from '@expo/config-plugins'
import path from 'path'
import fs from 'fs-extra'

// 复制 core 项目到 android/core
const withCopyCoreModule: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const src = path.join(projectRoot, 'plugins/core')
      const dest = path.join(projectRoot, 'android/core')

      if (fs.existsSync(src)) {
        await fs.remove(dest) // 清除旧的 core 目录（可选）
        await fs.copy(src, dest)
        console.log('✅ Copied core module to android/core')
      } else {
        console.warn('⚠️ plugins/core not found.')
      }

      return config
    },
  ])
}

// 将 WakeupModule.kt 和 WakeupPackage.kt 拷贝到 main 中
const withWakeupPackage: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot

      // 拷贝Module
      const sourceModulePath = path.join(
        projectRoot,
        'plugins/templates/WakeupModule.kt',
      )
      const targetModuleDir = path.join(
        projectRoot,
        'android/app/src/main/java/com/anonymous/androidboard',
      )
      const targetModulePath = path.join(targetModuleDir, 'WakeupModule.kt')
      await fs.ensureDir(targetModuleDir)
      await fs.copyFile(sourceModulePath, targetModulePath)
      console.log('✅ WakeupModule.kt injected.')

      // 拷贝Package
      const sourcePackagePath = path.join(
        projectRoot,
        'plugins/templates/WakeupPackage.kt',
      )
      const targetPackagePath = path.join(targetModuleDir, 'WakeupPackage.kt')
      await fs.copyFile(sourcePackagePath, targetPackagePath)
      console.log('✅ WakeupPackage.kt injected.')

      return config
    },
  ])
}

const withBaiduWakeUp: ConfigPlugin = config => {
  // 在 settings.gradle 中添加 core 模块
  config = withSettingsGradle(config, mod => {
    const includeLine = `include ':core'`
    const projectDirLine = `project(':core').projectDir = new File(rootDir, 'core')`

    if (!mod.modResults.contents.includes(includeLine)) {
      mod.modResults.contents += `\n${includeLine}`
    }
    if (!mod.modResults.contents.includes(projectDirLine)) {
      mod.modResults.contents += `\n${projectDirLine}`
    }

    return mod
  })

  // 添加 core 项目依赖
  config = withAppBuildGradle(config, config => {
    const gradle = config.modResults.contents
    const dependencyLine = `    implementation project(path: ':core')`

    if (!gradle.includes(dependencyLine)) {
      const lines = gradle.split('\n')
      const index = lines.findIndex(line =>
        line.trim().startsWith('dependencies {'),
      )

      if (index !== -1) {
        lines.splice(index + 1, 0, dependencyLine) // 插入到下一行
        config.modResults.contents = lines.join('\n')
      }
    }

    return config
  })

  // 在 MainApplication 中添加 WakeUpPackage
  config = withMainApplication(config, config => {
    const mainApplication = config.modResults
    if (mainApplication.language === 'java') {
      throw new Error('Only Kotlin MainApplication is supported.')
    }

    const importLine = 'import com.anonymous.androidboard.WakeUpPackage'
    const registerLine = 'packages.add(WakeUpPackage())'

    if (!mainApplication.contents.includes(importLine)) {
      mainApplication.contents = mainApplication.contents.replace(
        /^package .*$/m,
        m => `${m}\n\n${importLine}`,
      )
    }

    if (!mainApplication.contents.includes(registerLine)) {
      mainApplication.contents = mainApplication.contents.replace(
        /return packages/,
        `${registerLine}\n            return packages`,
      )
    }

    return config
  })

  return config
}

// 拷贝jniLibs到app中
const withJniLibs: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const src = path.join(projectRoot, 'plugins/core/src/main/jniLibs')
      const dest = path.join(projectRoot, 'android/app/src/main/jniLibs')

      if (fs.existsSync(src)) {
        await fs.remove(dest)
        await fs.copy(src, dest)
        console.log('✅ Copied jniLibs to android/app')
      } else {
        console.warn('⚠️ jniLibs not found.')
      }

      return config
    },
  ])
}

// 拷贝 assets 到 app 中
const withAssets: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const src = path.join(projectRoot, 'plugins/core/src/main/assets')
      const dest = path.join(projectRoot, 'android/app/src/main/assets')

      if (fs.existsSync(src)) {
        await fs.remove(dest)
        await fs.copy(src, dest)
        console.log('✅ Copied assets to android/app')
      } else {
        console.warn('⚠️ assets not found.')
      }
      return config
    },
  ])
}

const withBaiduSpeech: ConfigPlugin = config => {
  config = withCopyCoreModule(config)
  config = withWakeupPackage(config)
  config = withBaiduWakeUp(config)
  config = withJniLibs(config)
  config = withAssets(config)
  return config
}

export default withBaiduSpeech
