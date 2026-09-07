# HNK QuestRenderer + ExperienceDirector V1

Status: implementation scaffold.

## Decisão

O runtime é dividido em três camadas:

1. `ExperienceDirector` — interpreta o Quest Definition considerando contexto do usuário e disponibilidade do dispositivo.
2. `QuestRuntime` — mantém estado, checkpoints, pausa, interrupção, safety stop e avanço de fases.
3. `QuestRendererRegistry` — adapter de UI. Web/React e Expo/React Native registram renderers para os mesmos tipos de fase.

Nenhuma dessas camadas altera conteúdo canônico, XP ou Completion Contract.

## Responsabilidades do ExperienceDirector

- resolver uma fase por `id`;
- aplicar reduced motion;
- impedir fallback silencioso de áudio canônico obrigatório;
- permitir Voice Practice sem captura quando não houver microfone;
- preservar fases opcionais indisponíveis como estado explícito;
- determinar próxima fase e fase de retomada;
- verificar se todas as fases obrigatórias foram executadas.

## Responsabilidades do QuestRuntime

Estados de runtime:

`IDLE → ACTIVE → PAUSED / INTERRUPTED / SAFETY_STOP → ACTIVE → EVIDENCE_PENDING → COMPLETE`

O runtime não concede XP. A conclusão oficial continua pertencendo ao backend e ao Completion Contract versionado.

## Responsabilidades do QuestRenderer

O renderer não decide regra de negócio. Ele recebe uma `ExperienceDirective` e desenha a interface adequada.

Exemplos de adapters futuros:

- `NARRATIVE` → PortalScene
- `READ` → CanonReader
- `FOCUS` → FocusPractice
- `AUDIO` → RitualAudioPlayer
- `VOICE` → VoicePractice
- `RETURN` → ReturnGate
- `STRUCTURED_JOURNAL` → SoulMirror
- `CORRESPONDENCE_REVEAL` → CorrespondenceWheel
- `COMPLETION` → DaySeal
- `UNLOCK` → TreeProgressReveal

## Regra crítica

Se uma fase canônica obrigatória não puder ser executada, o Director retorna `BLOCKED`. Ele nunca marca a fase como concluída por conveniência.

Fases opcionais tecnicamente indisponíveis retornam `OPTIONAL_UNAVAILABLE`.

## Golden Day

O primeiro contrato consumidor é `HNK-KETHER-D001-V2` em:

`docs/experience/kether/day-001/day-001.quest.json`

O próximo passo de implementação é criar um adapter React Web e um adapter React Native/Expo sobre este núcleo, depois ligar o Completion Contract V2 ao backend.
