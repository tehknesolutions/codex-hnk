import type { HnkBoard } from './board';
import { assertBoardContract } from './board';
import { ketherChapterOverview } from './boards/kether-chapter-overview';

const boardEntries = [ketherChapterOverview] as const;

export const boardCatalog: Readonly<Record<string, HnkBoard>> = Object.freeze(
  Object.fromEntries(
    boardEntries.map((board) => {
      const validated = assertBoardContract(board);
      return [validated.id, validated];
    }),
  ),
);

export function getBoard(id: string): HnkBoard | undefined {
  return boardCatalog[id];
}

export function listBoards(): HnkBoard[] {
  return Object.values(boardCatalog);
}

export function listBoardsByFamily(family: HnkBoard['family']): HnkBoard[] {
  return listBoards().filter((board) => board.family === family);
}

export function listBoardsByScope(scope: HnkBoard['scope'], scopeId?: string): HnkBoard[] {
  return listBoards().filter(
    (board) => board.scope === scope && (scopeId === undefined || board.scopeId === scopeId),
  );
}
