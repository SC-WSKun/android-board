import ImageContainer from "@/components/ui/ImageContainer";
import { StyleSheet, ImageBackground, View, Text } from "react-native";

export default function SettingScreen() {
  return (
    <ImageContainer>
      <View style={styles.settingView}>
        <Text>设置</Text>
      </View>
    </ImageContainer>
  );
}

const styles = StyleSheet.create({
    settingView: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
