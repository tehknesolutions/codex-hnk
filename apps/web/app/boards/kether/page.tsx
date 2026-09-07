import { getBoard } from '@hnk/assets';
import { notFound } from 'next/navigation';
import { HnkBoardRenderer } from '../_components/HnkBoardRenderer';

export default function KetherBoardPage() {
  const board = getBoard('kether-chapter-overview-v1');

  if (!board) notFound();

  return <HnkBoardRenderer board={board} />;
}
