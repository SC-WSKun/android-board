# Android-Board For 351 Robot Control

用 [Expo](https://expo.dev) 搭的机器人安卓控制端

地图相关的操作采用skia引擎，[react-native-skia](https://github.com/shopify/react-native-skia)这个仓库很活跃，[skia](https://skia.org/)本身是google下的2D图形引擎，可靠性也比较高。本来就支持在安卓平台上使用，因此优化上比react-native-canvas好不少。

## Todo

- [x] 接入Foxglove Bridge与机器人进行通信
- [x] 完成地图绘制（用react-native-skia进行开发）
- [x] 完成小车显示
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
3. 给用户弹窗提示使用了react-native-toast-message，调用方式如下：
   ```js
   import Toast from 'react-native-toast-message'

   const showToast = () => {
      Toast.show({
         type: 'info',
         text1: 'You Have Switched To Redirect Mode',
      })
   }
   ```

## 踩的一些坑

1. **[RangeError: DataView.prototype.get<Type>(): Cannot read that many bytes]**

   callService调用的时候需要注意service的异步更新导致的error。特别注意switch_mode和其它service一起调用。

2. **通过GestureDetector来管理触控事件时，运行回调函数奔溃**

   `GestureDetector`触发事件的回调函数运行在UI线程中，如果回调函数中需要更新数据，需要注意尽量使用`useSharedValue`来保存变量。否则需要用`runOnJS`包裹函数，在JS线程中运行

3. 坐标变换

   接手这个项目前建议先学习下机器人坐标系之间的关系，以及坐标系的变换。这里介绍下前端比机器人端多出来的两个坐标系。

   - 地图坐标系（自己命名的,跟map坐标不是同一个东西）：地图坐标系是指以地图的左上角为原点的坐标系，为什么需要引入这个是因为canvas在渲染ImageData时，坐标系原点是左上角。在确定视图中心，视图边界的时候需要用到这个坐标系。这个坐标系可以直接用地图的width/height来定位，也可以通过map的origin将map坐标（比如小车）转换过来。
   - 视图坐标系（我有时候称为Canvas坐标系）：这个坐标系是出于局部渲染的需要，地图太大的时候我们不希望将整个地图渲染到视图中，而是将一部分渲染到视图中，因此需要引入这个坐标系。这个坐标系是在地图上渲染组件的重要坐标系，小车、轨迹这些都需要在这个坐标系中进行渲染。可以通过视图边界所在的坐标来确定当前组件的位置。

## 资源链接

1. [腾讯云Deepseek API](https://cloud.tencent.com/document/product/1772/115963)
