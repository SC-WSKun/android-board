import { useEffect } from 'react'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { Provider } from 'react-redux'
import { Buffer } from 'buffer'
import store from '@/store/store'
import Toast from 'react-native-toast-message'
import { useColorScheme } from '@/hooks/useColorScheme'
import SocketProxy, { AUDIO_FILE_PATH } from '@/utils/TtsSocketProxy'

// Buffer polyfill
global.Buffer = Buffer

const ROUTER_MAP = {
  HOME: 'index' as const,
  NAVIGATION: 'navigation' as const,
  PATROL: 'patrol' as const,
  SETTING: 'setting' as const,
  NOT_FOUND: '+not-found' as const,
}

// 使用映射生成 NAVIGATION_MAP，因为 expo-router 跳转的时候需要使用 / 开头
type NavigationMapType = {
  [K in keyof typeof ROUTER_MAP]: `/${(typeof ROUTER_MAP)[K]}`
}

export const NAVIGATION_MAP: NavigationMapType = {
  HOME: `/${ROUTER_MAP.HOME}`,
  PATROL: `/${ROUTER_MAP.PATROL}`,
  NAVIGATION: `/${ROUTER_MAP.NAVIGATION}`,
  SETTING: `/${ROUTER_MAP.SETTING}`,
  NOT_FOUND: `/${ROUTER_MAP.NOT_FOUND}`,
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    XiaXing: require('../assets/fonts/Slidexiaxing-Regular.ttf'),
  })
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  SocketProxy.init()

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Provider store={store}>
          <Stack>
            <Stack.Screen
              name={ROUTER_MAP.HOME}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ROUTER_MAP.PATROL}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ROUTER_MAP.NAVIGATION}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ROUTER_MAP.SETTING}
              options={{ headerShown: false }}
            />
            <Stack.Screen name={ROUTER_MAP.NOT_FOUND} />
          </Stack>
        </Provider>
      </ThemeProvider>
      <Toast />
    </>
  )
}
