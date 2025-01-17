import { PropsWithChildren } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'

type Props = PropsWithChildren<{}>
export default function ImageContainer({ children }: Props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/home-bg.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.grayContainer}>{children}</View>
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
  grayContainer: {
    width: '90%',
    height: '90%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
