import { Text, View } from 'react-native'
import { useState } from 'react'
import VelocityNipple from '@/components/VelocityNipple'

export default function Test() {
  const [value, setValue] = useState<string>('')
  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <Text>Current position {value}</Text>
      <VelocityNipple />
    </View>
  )
}
