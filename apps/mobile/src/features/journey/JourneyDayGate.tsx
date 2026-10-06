import type {ReactNode} from 'react';
import {Text,View} from 'react-native';
import {resolveMobileJourneyTarget} from './mobileJourneyAdapter';

export function JourneyDayGate({dayId,children}:{dayId:string;children:ReactNode}){
 const target=resolveMobileJourneyTarget(dayId);
 if(target.status !== 'AVAILABLE')return <View accessibilityRole="summary"><Text>DAY {dayId} · {target.status==='DORMANT'?'DORMENTE':'INDISPONÍVEL'}</Text></View>;
 return <>{children}</>;
}
