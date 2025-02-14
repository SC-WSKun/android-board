# Android-Board For 351 Robot Control

用 [Expo](https://expo.dev) 搭的机器人安卓控制端

地图相关的操作采用skia引擎，[react-native-skia](https://github.com/shopify/react-native-skia)这个仓库很活跃，[skia](https://skia.org/)本身是google下的2D图形引擎，可靠性也比较高。本来就支持在安卓平台上使用，因此优化上比react-native-canvas好不少。

## Todo
- [x] 接入Foxglove Bridge与机器人进行通信
- [x] 完成地图绘制（用react-native-skia进行开发）
- [ ] 完成激光点云插件封装
- [ ] 完成地图导航交互
- [ ] 完成地图标点交互
- [x] 完成标点导航交互
- [ ] 完成机器人对话交互


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and
create a blank **app** directory where you can start developing.

## 资源链接
1. [腾讯云Deepseek API](https://cloud.tencent.com/document/product/1772/115963)