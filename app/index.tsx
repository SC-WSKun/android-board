import { StyleSheet, View, ImageBackground, Text } from 'react-native'
import { Link } from 'expo-router'
import { useEffect } from 'react'
import { log } from '@/log/logger'
import { NAVIGATION_MAP } from './_layout'

export default function HomeScreen() {
  useEffect(() => {
    log.success('home screen')
  }, [])
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/home-bg.jpg')}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>迎宾机器人</Text>

        <View style={styles.buttonContainer}>
          <Link style={styles.button} href={NAVIGATION_MAP.PATROL}>
            巡逻
          </Link>
          <Link style={styles.button} href={NAVIGATION_MAP.NAVIGATION}>
            导航
          </Link>
          <Link style={styles.button} href='/buildmap'>
            建图
          </Link>
          <Link style={styles.button} href={NAVIGATION_MAP.SETTING}>
            设置
          </Link>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  },
  titleContainer: {
    marginBottom: 50,
  },
  title: {
    fontSize: 150,
    color: 'white',
    fontFamily: 'XiaXing',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    borderRadius: 5,
    color: 'rgba(0,0,0,0.7)',
    fontSize: 25,
    fontWeight: 'bold',
  },
})
