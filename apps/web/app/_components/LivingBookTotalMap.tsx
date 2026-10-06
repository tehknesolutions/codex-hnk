'use client';

import {
  hnkTreeLevels,
  hnkTreeNodes,
  type HnkTreeLevelId,
} from '../../../../packages/visual-contract/src/tree';

export interface LivingBookTotalMapProps {
  selectedLevelId: HnkTreeLevelId | null;
  onSelectLevel: (levelId: HnkTreeLevelId) => void;
}

export function LivingBookTotalMap({ selectedLevelId, onSelectLevel }: LivingBookTotalMapProps) {
  return (
    <section className="living-book-total-map" aria-label="Visão Total da Árvore HNK">
      <div className="living-book-total-map__axis" aria-hidden="true" />
      <div className="living-book-total-map__nodes" role="group" aria-label="Esferas da Visão Total">
        {hnkTreeNodes.map((node, index) => {
          const level = hnkTreeLevels.find((candidate) => candidate.id === node.levelId);
          return (
            <div className="living-book-total-map__step" key={node.id}>
              {index > 0 ? <span className="living-book-total-map__connector" aria-hidden="true" /> : null}
              <button
                type="button"
                className="living-book-total-map__node"
                data-state={node.state}
                aria-pressed={selectedLevelId === node.levelId}
                onClick={() => onSelectLevel(node.levelId)}
              >
                <span className="living-book-total-map__index">{node.index}</span>
                <strong>{node.label}</strong>
                <small>{level?.dayRange ?? 'FAIXA INDISPONÍVEL'}</small>
                <em>{node.state === 'dormant' ? 'ESTRUTURA DORMENTE' : node.state.toUpperCase()}</em>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
