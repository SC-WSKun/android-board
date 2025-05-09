import {
  ConfigPlugin,
  withAppBuildGradle,
  withDangerousMod,
  withMainActivity,
} from '@expo/config-plugins'
import path from 'path'
import fs from 'fs-extra'

// 复制 .so 文件到 android/app/src/main/jniLibs
const withCopyNativeLibs: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const sourceLibsPath = path.join(
        projectRoot,
        'plugins/core/src/main/jniLibs',
      )
      const targetLibsPath = path.join(
        projectRoot,
        'android',
        'core',
        'src',
        'main',
        'jniLibs',
      )

      if (fs.existsSync(sourceLibsPath)) {
        await fs.ensureDir(targetLibsPath)
        await fs.copy(sourceLibsPath, targetLibsPath, { overwrite: true })
        console.log('✅ Copied native .so libraries to jniLibs.')
      } else {
        console.warn('⚠️ libs/jniLibs not found — skipping native lib copy.')
      }

      return config
    },
  ])
}

// 复制 jar 文件到 android/core/libs
const withCopyJarLibs: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const projectRoot = config.modRequest.projectRoot
      const jarSourcePath = path.resolve(
        projectRoot,
        'plugins/core/libs/bdasr_V3_20210628_cfe8c44.jar',
      )
      const targetLibsPath = path.join(
        projectRoot,
        'android/core/libs/bdasr_V3_20210628_cfe8c44.jar',
      )
      const targetDir = path.dirname(targetLibsPath) // 获取目标目录路径

      // 检查源文件是否存在
      if (fs.existsSync(jarSourcePath)) {
        // 确保目标目录存在，如果不存在则创建
        await fs.ensureDir(targetDir) // 创建目标目录
        // 复制 jar 文件到目标目录
        await fs.copy(jarSourcePath, targetLibsPath, { overwrite: true })
        console.log('✅ Copied jar libraries to libs.')
      } else {
        console.warn('⚠️ libs not found — skipping jar copy.')
      }

      return config
    },
  ])
}

// 添加 core 项目依赖
const withCoreProjectDependency: ConfigPlugin = config => {
  return withAppBuildGradle(config, config => {
    const gradle = config.modResults.contents

    const dependencyLine = `implementation project(path: ':core')`

    if (!gradle.includes(dependencyLine)) {
      config.modResults.contents = gradle.replace(
        /dependencies\s*{([\s\S]*?)}/,
        (match, inner) => {
          return `dependencies {\n${inner.trim()}\n    ${dependencyLine}\n}`
        },
      )
    }

    return config
  })
}

const withKotlinMainActivityImport: ConfigPlugin = config => {
  return withMainActivity(config, config => {
    const { modResults } = config
    const importLine = 'import com.baidu.speech.asr.SpeechRecognizer'
    if (!modResults.contents.includes(importLine)) {
      modResults.contents = modResults.contents.replace(
        /^package .+$/m,
        match => `${match}\n${importLine}`,
      )
    }
    return config
  })
}

const withBaiduSpeech: ConfigPlugin = config => {
  config = withCopyNativeLibs(config)
  config = withCopyJarLibs(config)
  config = withCoreProjectDependency(config)
  config = withKotlinMainActivityImport(config)
  return config
}

export default withBaiduSpeech
