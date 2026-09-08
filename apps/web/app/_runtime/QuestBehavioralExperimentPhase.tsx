'use client';

import { useMemo, useState } from 'react';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface BehavioralExperimentResult {
  before: Record<string, number>;
  after: Record<string, number>;
  observationRecorded: true;
}

export interface QuestBehavioralExperimentPhaseProps {
  directive: ExperienceDirective;
  onResult: (result: BehavioralExperimentResult) => void;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
}

function fieldLabel(field: string): string {
  return field.replaceAll('_', ' ').toUpperCase();
}

function initialRatings(fields: string[]): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field, 5]));
}

export function QuestBehavioralExperimentPhase({
  directive,
  onResult,
  onCompletePhase,
  onSafetyStop,
}: QuestBehavioralExperimentPhaseProps) {
  const beforeFields = useMemo(
    () => Array.isArray(directive.phase.interaction?.before_fields) ? directive.phase.interaction?.before_fields.filter((v): v is string => typeof v === 'string') : [],
    [directive],
  );
  const afterFields = useMemo(
    () => Array.isArray(directive.phase.interaction?.after_fields) ? directive.phase.interaction?.after_fields.filter((v): v is string => typeof v === 'string') : [],
    [directive],
  );
  const [before, setBefore] = useState<Record<string, number>>(() => initialRatings(beforeFields));
  const [after, setAfter] = useState<Record<string, number>>(() => initialRatings(afterFields));
  const [started, setStarted] = useState(false);
  const [observed, setObserved] = useState(false);

  const canComplete = started && observed && beforeFields.every((field) => Number.isInteger(before[field])) && afterFields.every((field) => Number.isInteger(after[field]));
  const technique = typeof directive.phase.interaction?.technique === 'string' ? directive.phase.interaction.technique : null;
  const noCausalClaim = directive.phase.interaction?.causality_claim_allowed === false;

  function slider(fields: string[], values: Record<string, number>, setValues: (next: Record<string, number>) => void) {
    return fields.map((field) => (
      <label key={field} style={{ display: 'grid', gap: 6, marginBlock: 10 }}>
        <span>{fieldLabel(field)} · {values[field] ?? 5}</span>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={values[field] ?? 5}
          onChange={(event) => setValues({ ...values, [field]: Number(event.target.value) })}
        />
      </label>
    ));
  }

  return (
    <section data-experiment-key={String(directive.phase.interaction?.experiment_key ?? '')} style={{ display: 'grid', gap: 16 }}>
      <div>
        <strong>EXPERIMENTO · ANTES/DEPOIS</strong>
        {technique ? <p>Técnica: <code>{technique}</code></p> : null}
        <p>Registre expectativa e experiência percebida. “Nenhuma mudança perceptível” é um resultado válido.</p>
        {noCausalClaim ? <p>Esta observação não prova causalidade médica, bioquímica, energética ou metafísica.</p> : null}
      </div>

      <fieldset disabled={started}>
        <legend>ANTES</legend>
        {slider(beforeFields, before, setBefore)}
      </fieldset>

      {!started ? <button type="button" onClick={() => setStarted(true)}>INICIAR EXPERIMENTO</button> : null}

      {started ? (
        <fieldset>
          <legend>DEPOIS</legend>
          {slider(afterFields, after, setAfter)}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={observed} onChange={(event) => setObserved(event.target.checked)} />
            Registrei honestamente o que percebi, inclusive se não houve mudança.
          </label>
        </fieldset>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => void onSafetyStop('experiment_safety_stop')}>ENCERRAR COM SEGURANÇA</button>
        <button
          type="button"
          disabled={!canComplete}
          onClick={() => {
            const result: BehavioralExperimentResult = { before, after, observationRecorded: true };
            onResult(result);
            void onCompletePhase(directive.phase.id);
          }}
        >
          REGISTRAR OBSERVAÇÃO · CONTINUAR
        </button>
      </div>
    </section>
  );
}
