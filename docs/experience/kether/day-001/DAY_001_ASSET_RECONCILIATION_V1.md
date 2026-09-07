# HNK CODEX — DAY 001 ASSET RECONCILIATION V1

**Status:** reconciliation complete / production approval incomplete  
**Quest:** `HNK-KETHER-D001-V2`  
**Scope:** ten required Golden Day asset slots

## Resultado executivo

A auditoria separou quatro coisas que antes estavam misturadas: master canônico, geometria procedural, mockup visual e asset final de produção.

O Day 001 não precisa transformar toda a experiência em PNG. O app antigo já contém uma gramática procedural útil para Kether: `OriginCosmos`, `BoazAxis`, `ConvergenceGeometry`, `TreeField` e o campo reflexivo do Espelho. Esses elementos devem voltar como primitivas do renderer quando o shell migrar, preservando reduced motion e estado derivado do runtime.

Ao mesmo tempo, dois masters canônicos foram encontrados no repositório editorial e migrados para o novo repo. A migração foi verificada por Git blob SHA, portanto é byte-idêntica à fonte:

- Dai Koo Myo Usui — `assets/canonical/kether/dai-koo-myo-usui-hnk-master-v1.svg`;
- Sigilo da Coroa de Kether — `assets/canonical/kether/kether-sigil-v1.svg`.

O Dai Koo Myo resolve diretamente o slot `dai-koo-myo-approved`. O Sigilo de Kether **não** resolve automaticamente `kether-crown-symbol`: ele é o master integral aprovado para Kether/Portal 036 e não deve ser recortado ou reinterpretado silenciosamente como ícone do Day 001.

## Classificação dos dez slots

| Slot | Estado | Decisão |
|---|---|---|
| `kether-origin-background` | fonte procedural encontrada | extrair `OriginCosmos` para primitive compartilhada |
| `kether-crown-symbol` | revisão canônica necessária | aprovar derivativo próprio do Day 001 ou redefinir semanticamente o slot |
| `kether-tree-node` | fonte procedural encontrada | extrair de `TreeField` |
| `day001-key-art` | candidatos visuais existem, nenhum aprovado | finalizar artwork sem XP/texto mutável embutido |
| `dai-koo-myo-approved` | **aprovado e migrado** | usar SVG canônico byte-idêntico |
| `day001-jachin-field` | fonte/composição procedural encontrada | extrair campo de expansão/foco; não copiar scoring antigo |
| `day001-boaz-field` | fonte procedural encontrada | extrair `BoazAxis` |
| `day001-middle-field` | fonte procedural encontrada | extrair `ConvergenceGeometry` |
| `soul-mirror-background` | gramática procedural encontrada | construir campo reflexivo sem copy/reward antigo embutido |
| `first-spark-animation` | fonte procedural encontrada | extrair `TreeField(sealed)` com fallback reduced-motion |

## Masters canônicos migrados

### Dai Koo Myo

A referência aprovada define o master vertical `大光明`, SVG com outlines e SHA-256 `25d7853168b209665a66c01a83b3ebd4681b620e1ae2a98e65d74fbab6f7b4d0`.

O asset migrado possui o mesmo Git blob SHA da fonte: `973ed0e6da0bc1d48990970a9e10d7e811dc785c`.

Regra de produto: não substituir por variante Tibetan/Dumo, glyph inventado ou geração de IA.

### Sigilo de Kether

Master aprovado: três anéis, doze gates, trinta e seis marcas e eixo norte da Coroa.

SHA-256 canônico: `7792ad999497f502d29c4377d3497c02241421701e5762ed247c5351fb24320a`.

O asset migrado possui o mesmo Git blob SHA da fonte: `303af75e50ccf5dfd0f4be606143ae06739da4eb`.

Ele permanece referência do sistema Kether/Portal 036. O Day 001 não recebe autorização automática para reduzir o master a uma coroa isolada.

## Geometria procedural recuperada

A Vertical Slice antiga contém material de alto valor reutilizável, mas ele deve ser migrado como código de apresentação, não como verdade canônica.

Fonte auditada:

`Tehkne-Solutions/codex-hnk-app/apps/mobile/src/features/kether/Day001ImmersiveMobileVerticalSlice.tsx`

Blob: `c5f37b1ea2ca985575f497fe4843c0c8f1db006d`.

Componentes úteis:

- `OriginCosmos` — ponto, anéis e eixo primordial;
- `BoazAxis` — contração/estrutura em eixo e nós;
- `ConvergenceGeometry` — linhas convergentes e centro;
- `TreeField` — Árvore/nós e estado visual de selo;
- `reflectionField` — gramática visual do Espelho.

Isso permite reduzir a quantidade de imagens raster obrigatórias do Golden Day e melhora responsividade, acessibilidade e reduced motion.

## Mockups visuais produzidos anteriormente

Os renders existentes são bons como direção de arte, mas **não são assets finais de runtime**.

Encontramos, entre outros:

- `códex_cósmico_a_coroa_da_jornada.png`;
- `codex_lab_001_a_coroa_antes_da_forma.png`;
- `temporizador_cósmico_da_prática_de_silêncio.png`;
- `jornada_cósmica_antes_da_prática.png`;
- `codex_lab_espelho_da_alma.png`.

Motivos do bloqueio incluem:

- `+50 XP` embutido quando o Canon atual exige `+150 XP`;
- `+1 FOCO` por retorno, incompatível com a política atual de `attention_return` sem score/XP;
- achievement sets e copy anteriores ao Golden Day V2;
- texto mutável incorporado em arte raster, criando risco de drift.

Regra adotada:

> Mockup pode orientar composição, atmosfera e densidade. Não pode ser promovido a asset aprovado enquanto carregar regras ou textos superados.

## Nova recomendação de asset model

Os slots do Quest devem aceitar pelo menos:

- `CANONICAL_VECTOR`;
- `PROCEDURAL_SCENE`;
- `PROCEDURAL_ANIMATION`;
- `IMAGE_ART`;
- `TEXTURE`.

Assim `day001-boaz-field`, por exemplo, não precisa existir como JPEG se uma primitive auditada produz a experiência de forma melhor.

## Release blockers restantes

O antigo blocker genérico `ASSET-001-REGISTRY-RESOLUTION` pode ser considerado reconciliado.

Ele é substituído por blockers específicos:

1. `ASSET-001-CROWN-DERIVATIVE` — aprovar a semântica visual da Coroa do Day 001;
2. `ASSET-001-KEY-ART` — produzir/aprovar key art final sem copy mutável;
3. `ASSET-001-PROCEDURAL-EXTRACTION` — migrar as primitives do shell antigo para o renderer compartilhado;
4. `ASSET-001-SOUL-MIRROR-FINAL` — aprovar o campo visual final do Espelho.

## Resultado

Dos dez slots:

- **1 está completamente aprovado e migrado** (`dai-koo-myo-approved`);
- **6 possuem fonte procedural concreta já localizada**;
- **3 ainda exigem decisão/produção visual final**.

A situação agora deixou de ser “dez assets desaparecidos”. O backlog visual ficou pequeno, explícito e auditável.
