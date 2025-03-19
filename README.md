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

## 开发建议
1. 整个应用最复杂的应该就是地图组件，我的开发思路是用 hook 去做封装，每一个hook都对应一个组件，这样子后续管理地图插件比较方便，不要直接写在RobotMap里面。
2. 日志打印，用react-native-logs，可以很方便的在控制台打印日志，并且可以设置日志等级，方便调试。

## 踩的一些坑
1. **[RangeError: DataView.prototype.get<Type>(): Cannot read that many bytes]**

   callService调用的时候需要注意service的异步更新导致的error。特别注意switch_mode和其它service一起调用。

## 资源链接
1. [腾讯云Deepseek API](https://cloud.tencent.com/document/product/1772/115963)