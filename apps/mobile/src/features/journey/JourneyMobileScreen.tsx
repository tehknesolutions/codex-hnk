import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {getMobileJourneySlots} from './mobileJourneyAdapter';

export function JourneyMobileScreen(){
 const slots=getMobileJourneySlots();
 return <ScrollView contentContainerStyle={s.shell}><Text style={s.title}>JORNADA HNK</Text><Text style={s.lead}>109 câmaras estruturais. Somente Days AVAILABLE possuem travessia executável.</Text><View style={s.grid}>{slots.map(slot=>slot.status==='AVAILABLE'?<Pressable key={slot.dayId} accessibilityRole="button" onPress={()=>router.push(slot.href as never)} style={s.slot}><Text>DAY {slot.dayId}</Text><Text>DISPONÍVEL</Text></Pressable>:<View key={slot.dayId} accessibilityState={{disabled:true}} style={s.slot}><Text>DAY {slot.dayId}</Text><Text>DORMENTE</Text></View>)}</View></ScrollView>;
}
const s=StyleSheet.create({shell:{padding:20,gap:12},title:{fontSize:28,fontWeight:'700'},lead:{fontSize:15},grid:{gap:8},slot:{padding:14,borderWidth:1,borderRadius:10}});
