import { useRef } from 'react';
import {
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroARScene,
  ViroDirectionalLight,
  ViroMaterials,
  ViroNode,
  ViroSphere,
  ViroText,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';
import {
  DaiKoMyoArGeometry,
  DAI_KO_MYO_AR_GEOMETRY_ID,
  DAI_KO_MYO_AR_SOURCE_REFERENCE_ID,
} from './DaiKoMyoArGeometry';

export type MahasiahArMode = 'anchor' | 'active' | 'control';

export type MahasiahArSceneProps = {
  mode: MahasiahArMode;
  visitedPoints: readonly number[];
  onTrackingChange: (normal: boolean, reason?: number) => void;
  onAnchorCreated: (payload: { anchorId: string | null; tapPosition: number[] | null }) => void;
  onPointVisited: (index: number) => void;
};

type SceneNavigatorLike = {
  viroAppProps?: MahasiahArSceneProps;
};

const POINTS = [
  { index: 0, label: 'I', position: [-0.48, 0.04, -0.48] as [number, number, number] },
  { index: 1, label: 'II', position: [0.48, 0.04, -0.48] as [number, number, number] },
  { index: 2, label: 'III', position: [0.48, 0.04, 0.48] as [number, number, number] },
  { index: 3, label: 'IV', position: [-0.48, 0.04, 0.48] as [number, number, number] },
] as const;

ViroMaterials.createMaterials({
  hnkArPointPending: {
    lightingModel: 'Constant',
    diffuseColor: '#8D7846',
  },
  hnkArPointVisited: {
    lightingModel: 'Constant',
    diffuseColor: '#F4D978',
    bloomThreshold: 0.8,
  },
  hnkArPlane: {
    lightingModel: 'Constant',
    diffuseColor: '#5B4E2A44',
  },
});

export function MahasiahDay025ArScene({ sceneNavigator }: { sceneNavigator: SceneNavigatorLike }) {
  const selectorRef = useRef<any>(null);
  const props = sceneNavigator.viroAppProps;

  if (!props) return <ViroARScene />;

  return (
    <ViroARScene
      anchorDetectionTypes={['PlanesHorizontal']}
      onTrackingUpdated={(state: number, reason: number) => {
        props.onTrackingChange(state === ViroTrackingStateConstants.TRACKING_NORMAL, reason);
      }}
      onAnchorFound={(anchor: any) => selectorRef.current?.handleAnchorFound(anchor)}
      onAnchorUpdated={(anchor: any) => selectorRef.current?.handleAnchorUpdated(anchor)}
      onAnchorRemoved={(anchor: any) => anchor && selectorRef.current?.handleAnchorRemoved(anchor)}
    >
      <ViroAmbientLight color="#D9CCAE" intensity={260} />
      <ViroDirectionalLight color="#FFF2C4" direction={[0, -1, -0.2]} intensity={560} />

      <ViroARPlaneSelector
        ref={selectorRef}
        alignment="Horizontal"
        hideOverlayOnSelection
        useActualShape
        material="hnkArPlane"
        onPlaneSelected={(anchor: any, tapPosition?: number[]) => {
          props.onAnchorCreated({
            anchorId: typeof anchor?.anchorId === 'string' ? anchor.anchorId : null,
            tapPosition: Array.isArray(tapPosition) ? tapPosition : null,
          });
        }}
      >
        <ViroNode>
          <DaiKoMyoArGeometry visible={props.mode !== 'control'} />

          {props.mode !== 'anchor' ? POINTS.map((point) => {
            const visited = props.visitedPoints.includes(point.index);
            return (
              <ViroNode key={point.index} position={point.position}>
                <ViroSphere
                  radius={0.07}
                  materials={visited ? 'hnkArPointVisited' : 'hnkArPointPending'}
                  onClick={() => props.onPointVisited(point.index)}
                />
                <ViroText
                  text={point.label}
                  position={[0, 0.13, 0]}
                  scale={[0.13, 0.13, 0.13]}
                  width={2}
                  height={1}
                  textAlign="center"
                  color={visited ? '#FFF3B5' : '#BDAA73'}
                  transformBehaviors={['billboard']}
                />
              </ViroNode>
            );
          }) : null}
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

export const MAHASIAH_DAY_025_AR_CONTRACT = {
  geometryId: DAI_KO_MYO_AR_GEOMETRY_ID,
  canonicalReferenceId: DAI_KO_MYO_AR_SOURCE_REFERENCE_ID,
  markerCount: POINTS.length,
  planeAlignment: 'Horizontal',
  cameraFramesPersisted: false,
  videoRecordingRequired: false,
} as const;
