import {
  ConfigPlugin,
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  withMainApplication,
} from '@expo/config-plugins'
import { AndroidConfig } from '@expo/config-plugins'
import fs from 'fs'
import path from 'path'

const { getMainApplicationOrThrow } = AndroidConfig.Manifest

const withBaiduSpeechSDK: ConfigPlugin = config => {
  // 添加权限到 AndroidManifest.xml
  config = withAndroidManifest(config, config => {
    const app = getMainApplicationOrThrow(config.modResults)
    const permissions = [
      'android.permission.RECORD_AUDIO',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ]
    for (const permission of permissions) {
      config.modResults.manifest['uses-permission'] = [
        ...(config.modResults.manifest['uses-permission'] ?? []),
        { $: { 'android:name': permission } },
      ]
    }
    return config
  })

  // 添加 maven 仓库或 SDK 依赖到 android/build.gradle
  config = withProjectBuildGradle(config, config => {
    if (
      !config.modResults.contents.includes('maven { url "https://jitpack.io" }')
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s*{[^}]*repositories\s*{[^}]*}/,
        match => {
          return match.replace(
            /repositories\s*{[^}]*}/,
            repoBlock =>
              `${repoBlock}\n        maven { url "https://jitpack.io" }`,
          )
        },
      )
    }
    return config
  })

  // 添加 implementation 到 app/build.gradle
  config = withAppBuildGradle(config, config => {
    if (!config.modResults.contents.includes('implementation')) {
      config.modResults.contents += `\ndependencies {\n    implementation 'com.baidu.aip:java-sdk:4.15.7'\n}`
    } else {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{([\s\S]*?)}/,
        (match, inner) => {
          if (inner.includes('com.baidu.aip:java-sdk')) return match
          return `dependencies {\n${inner}    implementation 'com.baidu.aip:java-sdk:4.15.7'\n}`
        },
      )
    }
    return config
  })

  // TODO：根据你是否需要修改 MainApplication.java 可添加 withMainApplication

  return config
}

export default withBaiduSpeechSDK
