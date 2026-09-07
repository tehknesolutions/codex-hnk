export type BoardFamily =
  | 'chapter-overview'
  | 'cycle-overview'
  | 'day-board'
  | 'portal-board'
  | 'system-board'
  | 'concept-board';

export type BoardLifecycle =
  | 'planned'
  | 'structured'
  | 'rendered'
  | 'review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'retired';

export type BoardScope = 'global' | 'chapter' | 'sephira' | 'cycle' | 'day' | 'portal';

export type BoardRenderTarget =
  | 'print-landscape'
  | 'desktop'
  | 'tablet'
  | 'mobile-390'
  | 'thumbnail';

export interface BoardSourceRef {
  kind: 'canonical' | 'spec' | 'plan' | 'database' | 'design';
  label: string;
  repository?: string;
  path?: string;
  commitSha?: string;
  note?: string;
}

export interface BoardOutputRef {
  kind: 'board-img' | 'board-doc' | 'board-code';
  path: string;
  mimeType?: string;
  checksum?: string;
}

export interface BoardFact {
  label: string;
  value: string;
  emphasis?: 'primary' | 'secondary' | 'ritual' | 'system';
}

export interface BoardSection {
  id: string;
  title: string;
  eyebrow?: string;
  body?: string;
  facts?: BoardFact[];
  items?: string[];
}

export interface BoardCycle {
  id: string;
  index: number;
  label: string;
  days: [number, number];
  title: string;
  focus?: string;
  attributes?: string[];
  xpLabel?: string;
}

export interface BoardPortal {
  days: number[];
  title: string;
  destination?: string;
  summary?: string;
}

export interface BoardVisualContract {
  direction: 'HNK SACRED EDITORIAL FANTASY';
  density: 'sparse' | 'balanced' | 'dense-editorial';
  paletteIntent: string[];
  materialIntent: string[];
  allowedGeometry: string[];
  forbiddenAdditions: string[];
}

export interface HnkBoard {
  schemaVersion: '1.0';
  id: string;
  slug: string;
  family: BoardFamily;
  scope: BoardScope;
  scopeId: string;
  version: number;
  lifecycle: BoardLifecycle;
  title: string;
  subtitle?: string;
  rangeLabel?: string;
  summary?: string;
  facts: BoardFact[];
  sections: BoardSection[];
  cycles?: BoardCycle[];
  portal?: BoardPortal;
  sources: BoardSourceRef[];
  outputs: BoardOutputRef[];
  renderTargets: BoardRenderTarget[];
  visual: BoardVisualContract;
  accessibility: {
    alt: string;
    mobileSummary: string;
  };
}

export function assertBoardContract(board: HnkBoard): HnkBoard {
  if (board.version < 1) throw new Error('Board version must be >= 1');
  if (!board.sources.length) throw new Error('Board must declare at least one source');
  if (!board.outputs.some((output) => output.kind === 'board-doc')) {
    throw new Error('Board must declare a board-doc output');
  }
  if (!board.outputs.some((output) => output.kind === 'board-code')) {
    throw new Error('Board must declare a board-code output');
  }
  if (!board.renderTargets.includes('mobile-390')) {
    throw new Error('Board must declare the mobile-390 render target');
  }
  return board;
}
