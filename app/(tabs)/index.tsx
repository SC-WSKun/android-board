import { Image, StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      backgroundColor="#373D48"
      headerBackgroundColor={{"dark":"#373D48"}}
      stickyHeaderHeight={0}
      parallaxHeaderHeight={300}
      renderBackground={() => (
        <Image
          source={require('@/assets/images/sofa.jpg')}
          style={styles.backgroundImage}
        />
      )}
    >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>迎宾机器人</ThemedText>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => { /* 导航到建图页面 */ }}>
            <ThemedText style={styles.buttonText}>建图</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => { /* 导航到导航页面 */ }}>
            <ThemedText style={styles.buttonText}>导航</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => { /* 导航到交流页面 */ }}>
            <ThemedText style={styles.buttonText}>交流</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => { /* 导航到配置页面 */ }}>
            <ThemedText style={styles.buttonText}>配置</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#373D48',
  },
});