import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { getMobileLabSlots } from "./mobileLabAdapter";

export function LabMobileScreen() {
  const labs = getMobileLabSlots();
  return <ScrollView contentContainerStyle={s.shell}>
    <Text style={s.title}>LABS HNK</Text>
    <Text style={s.lead}>Prática executável projetada pelo mesmo Lab Registry do Codex. Slots dormentes não recebem navegação.</Text>
    <View style={s.grid}>{labs.map((lab) => lab.status === "AVAILABLE"
      ? <Pressable key={lab.dayId} accessibilityRole="button" accessibilityLabel={`Abrir Lab Day ${lab.dayId}`} onPress={() => router.push(lab.href as never)} style={s.slot}>
          <Text>LAB · DAY {lab.dayId}</Text><Text>DISPONÍVEL</Text>
        </Pressable>
      : <View key={lab.dayId} accessibilityState={{ disabled: true }} style={s.slot}>
          <Text>LAB · DAY {lab.dayId}</Text><Text>DORMENTE</Text>
        </View>)}</View>
  </ScrollView>;
}
const s=StyleSheet.create({shell:{padding:20,gap:12},title:{fontSize:28,fontWeight:"700"},lead:{fontSize:15},grid:{gap:8},slot:{padding:14,borderWidth:1,borderRadius:10}});
