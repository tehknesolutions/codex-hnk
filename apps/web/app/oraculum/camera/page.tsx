import type { Metadata } from 'next';
import { CameraConsultationClient } from './CameraConsultationClient';

export const metadata: Metadata = {
  title: 'HNK Oraculum Cube · Camera V0.7',
  description: 'Captura assistida por câmera com revisão manual obrigatória antes do HOC-256.',
};

export default function OraculumCameraPage() {
  return <CameraConsultationClient />;
}
