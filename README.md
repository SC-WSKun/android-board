# Android-Board For 351 Robot Control

用 [Expo](https://expo.dev) 搭的机器人安卓控制端

## Todo
- [x] 接入Foxglove Bridge与机器人进行通信
- [ ] 完成地图绘制（用react-native-canvas写了一个，发现这玩意的imageData不少bug，现在换成react-native-skia进行尝试）
- [ ] 完成地图交互（标点、导航）


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app
  development with Expo

You can start developing by editing the files inside the **app** directory. This
project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and
create a blank **app** directory where you can start developing.
