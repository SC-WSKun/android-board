import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Toast from 'react-native-toast-message'
import { useDrawContext } from '@/store/draw.slice'
import { useNavigation } from '@/hooks/useNavigation'

interface IMapToolBox {}
export function MapToolBox() {
  const { userTransform, updateTapMethod, updateUserTransform } =
    useDrawContext()
  const { advertiseNavTopic } = useNavigation()

  /**
   * 默认光标模式按钮
   */
  const PointerModBtn = () => {
    return (
      <TouchableOpacity
        style={styles.toolBtn}
        onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'You Have Switched To Pointer Mode',
          })
          updateTapMethod('POINTER')
        }}
      >
        <Icon
          name='mouse-pointer'
          size={20}
          color='#007bff'
          style={[styles.btnIcon, { paddingLeft: 7.5, paddingTop: 3.5 }]}
        />
      </TouchableOpacity>
    )
  }

  /**
   * 切换重定位模式按钮
   */
  const RedirectModBtn = () => {
    return (
      <TouchableOpacity
        style={styles.toolBtn}
        onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'You Have Switched To Redirect Mode',
          })
          updateTapMethod('REDIRECT')
        }}
      >
        <Icon
          name='thumb-tack'
          size={25}
          color='#007bff'
          style={[styles.btnIcon, { paddingLeft: 5.5 }]}
        />
      </TouchableOpacity>
    )
  }

  /**
   * 切换导航模式按钮
   */
  const NavModBtn = () => {
    return (
      <TouchableOpacity
        style={styles.toolBtn}
        onPress={() => {
          advertiseNavTopic()
          updateTapMethod('NAVIGATION')
          Toast.show({
            type: 'info',
            text1: 'You Have Switched To Navigation Mode',
          })
        }}
      >
        <Icon
          name='road'
          size={25}
          color='#007bff'
          style={[styles.btnIcon, { paddingLeft: 0 }]}
        />
      </TouchableOpacity>
    )
  }

  /**
   * 放大地图按钮
   */
  const ScaleUpBtn = () => {
    return (
      <TouchableOpacity
        style={styles.toolBtn}
        onPress={() => {
          updateUserTransform({
            x: userTransform.x,
            y: userTransform.y,
            resolution: userTransform.resolution * 0.5,
          })
        }}
      >
        <Icon
          name='search-plus'
          size={25}
          color='#007bff'
          style={styles.btnIcon}
        />
      </TouchableOpacity>
    )
  }

  /**
   * 缩小地图按钮
   */
  const ScaleDownBtn = () => {
    return (
      <TouchableOpacity
        style={styles.toolBtn}
        onPress={() => {
          updateUserTransform({
            x: userTransform.x,
            y: userTransform.y,
            resolution: userTransform.resolution * 2,
          })
        }}
      >
        <Icon
          name='search-minus'
          size={25}
          color='#007bff'
          style={styles.btnIcon}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.toolContainer}>
      <PointerModBtn />
      <RedirectModBtn />
      <NavModBtn />
      <ScaleUpBtn />
      <ScaleDownBtn />
    </View>
  )
}

const styles = StyleSheet.create({
  toolContainer: {
    width: 80,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  toolBtn: {
    width: 40,
    height: 40,
    padding: 5,
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 5,
  },
  btnIcon: {
    backgroundColor: 'transparent',
  },
})
