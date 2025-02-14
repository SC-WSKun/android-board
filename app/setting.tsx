import ImageContainer from '@/components/ui/ImageContainer'
import { initClient } from '@/store/foxgloveTrunk'
import { AppDispatch } from '@/store/store'
import { useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  Button,
  Pressable,
} from 'react-native'
import { useDispatch } from 'react-redux'

export default function SettingScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const [ipAddress, setIpAddress] = useState<string>('10.0.1.111') // 存储 IP 地址
  const [isValid, setIsValid] = useState<boolean>(true) // 存储 IP 地址的有效性状态

  // 校验 IP 地址的简单函数
  const validateIP = (ip: string) => {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return regex.test(ip)
  }

  // 提交 IP 配置
  const handleSubmit = () => {
    if (!validateIP(ipAddress)) {
      setIsValid(false)
      Alert.alert('错误', '请输入有效的 IP 地址！')
      return
    }
    dispatch(initClient(ipAddress))
      .then(() => {
        Alert.alert('成功', `IP 地址 ${ipAddress} 配置成功！`)
      })
      .catch((err: any) => {
        Alert.alert('错误', `IP 地址 ${ipAddress} 配置失败！${err}`)
      })
  }
  return (
    <ImageContainer>
      <View style={styles.settingView}>
        <Text style={styles.title}>设置机器人 IP 地址</Text>

        {/* IP 地址输入框 */}
        <TextInput
          style={[styles.input, !isValid && styles.inputError]}
          placeholder='请输入 IP 地址'
          keyboardType='numeric'
          value={ipAddress}
          onChangeText={value => {
            setIsValid(true)
            setIpAddress(value)
          }}
        />
        {!isValid && <Text style={styles.errorText}>请输入有效的 IP 地址</Text>}

        {/* 提交按钮 */}
        <Pressable onPress={handleSubmit}>
          <View style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>提交配置</Text>
          </View>
        </Pressable>
      </View>
    </ImageContainer>
  )
}

const styles = StyleSheet.create({
  settingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    paddingHorizontal: 25,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 15,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 15,
    borderRadius: 15,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'SpaceMono',
  },
})
