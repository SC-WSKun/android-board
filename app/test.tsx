import { Text, View } from 'react-native'
import NativeNipple from '@/components/NativeNipple'
import { useState } from 'react'

export default function Test() {
  const [value, setValue] = useState<string>('')
  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <Text>Current position {value}</Text>
      <NativeNipple
        radius={48}
        onUpdate={data => {
          setValue(`x: ${data.x.toFixed(2)}, y: ${data.y.toFixed(2)}`)
        }}
      />
    </View>
  )
}
