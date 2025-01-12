import { useGlobal } from "@/store/globalContext";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { View } from "react-native-reanimated/lib/typescript/Animated";
interface Props {
  imgUrl?: string;
  labelName: string;
  clickHandler: () => void;
}
export function LabelCard(props: Props) {
  const { imgUrl, labelName, clickHandler } = props;
  const global = useGlobal();

  useEffect(()=>{
    global.callService('/label_manager/get_labels', {}).then(res=>{
        console.log(res)
    })
  })
  return (
    <Pressable onPress={clickHandler}>
      <View style={styles.labelCard}>
        <Image source={{ uri: imgUrl }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    labelCard: {
        backgroundColor: 'white',
    }
});
