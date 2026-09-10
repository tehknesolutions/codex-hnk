import {useRef} from 'react';
import {StyleSheet,View} from 'react-native';
import {DAY025_DAI_KOO_MYO_POLYGONS} from '@hnk/assets';
import {ViroARPlaneSelector,ViroARScene,ViroARSceneNavigator,ViroNode,ViroPolygon,ViroTrackingStateConstants} from '@reactvision/react-viro';

export type Day025NativeARMode='ACTIVE'|'CONTROL'|'INTEGRATION';
export interface Day025NativeARStageProps{mode:Day025NativeARMode;onTrackingChange:(normal:boolean)=>void;onAnchorChange:(anchored:boolean)=>void}
interface SceneAppProps extends Day025NativeARStageProps{}
interface ViroSceneProps{sceneNavigator:{viroAppProps:SceneAppProps}}

function CanonicalDaiKooMyo(){return <ViroNode position={[0,0.45,0]} scale={[0.82,0.82,0.82]}>{DAY025_DAI_KOO_MYO_POLYGONS.map((poly,index)=><ViroPolygon key={`hnk-dkm-${index}`} vertices={poly.vertices.map(([x,y])=>[x,y])} holes={poly.holes.map(h=>h.map(([x,y])=>[x,y]))}/>)}</ViroNode>}

function Day025NativeARScene({sceneNavigator}:ViroSceneProps){const app=sceneNavigator.viroAppProps;const selectorRef=useRef<ViroARPlaneSelector>(null);const showSymbol=app.mode!=='CONTROL';return <ViroARScene anchorDetectionTypes={['PlanesHorizontal']} onTrackingUpdated={(state)=>app.onTrackingChange(state===ViroTrackingStateConstants.TRACKING_NORMAL)} onAnchorFound={(a)=>selectorRef.current?.handleAnchorFound(a)} onAnchorUpdated={(a)=>selectorRef.current?.handleAnchorUpdated(a)} onAnchorRemoved={(a)=>{if(a)selectorRef.current?.handleAnchorRemoved(a)}}>{showSymbol?<ViroARPlaneSelector ref={selectorRef} alignment="Horizontal" minWidth={0.25} minHeight={0.25} onPlaneSelected={()=>app.onAnchorChange(true)} onPlaneRemoved={()=>app.onAnchorChange(false)}><CanonicalDaiKooMyo/></ViroARPlaneSelector>:null}</ViroARScene>}

export function Day025NativeARStage(props:Day025NativeARStageProps){return <View style={styles.root}><ViroARSceneNavigator style={styles.root} provider="none" autofocus initialScene={{scene:Day025NativeARScene}} viroAppProps={props}/></View>}
const styles=StyleSheet.create({root:{flex:1,minHeight:420}});
