'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  getExecutableDays,
  hnkTreeLevels,
  hnkTreeNodes,
  type HnkTreeLevelId,
} from '../../../../packages/visual-contract/src/tree';

export interface LivingBookMapProps {
  selectedLevelId: HnkTreeLevelId | null;
  onSelectLevel: (levelId: HnkTreeLevelId) => void;
}

export function LivingBookMap({ selectedLevelId, onSelectLevel }: LivingBookMapProps) {
  const selectedNode = hnkTreeNodes.find((node) => node.levelId === selectedLevelId);
  const selectedLevel = hnkTreeLevels.find((level) => level.id === selectedLevelId);
  const days = useMemo(
    () => selectedLevelId ? getExecutableDays(selectedLevelId) : [],
    [selectedLevelId],
  );

  return (
    <div className="living-book-map" aria-label="Mapa interativo da Jornada HNK">
      <div className="living-book-map__levels" role="group" aria-label="Esferas disponíveis">
        {hnkTreeNodes.map((node) => {
          const level = hnkTreeLevels.find((candidate) => candidate.id === node.levelId);
          return (
            <button
              key={node.id}
              type="button"
              aria-pressed={selectedLevelId === node.levelId}
              data-state={node.state}
              onClick={() => onSelectLevel(node.levelId)}
            >
              <span>{node.index}</span>
              <strong>{node.label}</strong>
              <small>{level?.dayRange} · {node.state.toUpperCase()}</small>
            </button>
          );
        })}
      </div>

      {!selectedLevelId ? (
        <p className="living-book__note">Selecione uma esfera para revelar apenas as câmaras disponíveis daquela faixa.</p>
      ) : (
        <section className="living-book-map__selection" aria-live="polite">
          <header>
            <p>{selectedNode?.state.toUpperCase()}</p>
            <h3>{selectedNode?.label}</h3>
            <span>{selectedLevel?.dayRange}</span>
          </header>

          {days.length > 0 ? (
            <div className="living-book-map__days" aria-label={`Days disponíveis em ${selectedNode?.label}`}>
              {days.map(({ day, href }) => (
                <Link key={day} href={href} aria-label={`Abrir Day ${day}`}>
                  <span>DAY</span>
                  <strong>{day}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <p className="living-book__note" role="status">
              Esta esfera permanece visível no mapa, mas ainda não possui câmaras executáveis no repositório atual.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
