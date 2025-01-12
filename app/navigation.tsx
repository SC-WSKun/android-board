import ImageContainer from "@/components/ui/ImageContainer";
import { useGlobal } from "@/store/globalContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { NAVIGATION_MAP } from "./_layout";

export default function NavigationScreen() {
  const { foxgloveClientConnected } = useGlobal();
  useEffect(() => {
    if (!foxgloveClientConnected()) {
      router.push(NAVIGATION_MAP.SETTING);
    }
  }, [foxgloveClientConnected]);
  return (
    <ImageContainer>
      <View style={styles.navigationView}>
        <Text>请选择您要前往的目的地：</Text>
      </View>
    </ImageContainer>
  );
}

const styles = StyleSheet.create({
  navigationView: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
