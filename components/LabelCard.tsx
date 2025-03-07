import { callService } from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { useEffect } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { View } from 'react-native-reanimated/lib/typescript/Animated'
import { useDispatch } from 'react-redux'
interface Props {
  imgUrl?: string
  labelName: string
  clickHandler: () => void
}
export function LabelCard(props: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const { imgUrl, clickHandler } = props

  useEffect(() => {
    dispatch(callService('/label_manager/get_labels', {})).then(res => {
      console.log(res)
    })
  })
  return (
    <Pressable onPress={clickHandler}>
      <View style={styles.labelCard}>
        <Image source={{ uri: imgUrl }} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  labelCard: {
    backgroundColor: 'white',
  },
})
