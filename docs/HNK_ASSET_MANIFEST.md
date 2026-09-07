# HNK ASSET MANIFEST

Status: **schema v0.1**

## 1. Objetivo

Padronizar todos os assets do HNK para que sejam rastreáveis, regeneráveis, aprováveis e independentes de um único fornecedor de IA.

## 2. Famílias

### Globais
- logo HNK;
- marca tipográfica;
- background/base textures;
- ícones dos sete atributos;
- ícones das cinco trilhas;
- HUD de XP/Level;
- componentes de QR/audio/journal.

### Cosmologia
- 10 Sephiroth;
- 4 mundos;
- Árvore da Vida;
- caminhos/portais;
- estados locked/active/complete.

### Oraculares
- Tarot;
- Runas;
- I-Ching;
- sigilos e selos aprovados.

### Ciclos
- identidade visual dos ciclos angelicais;
- emblema;
- portrait/representação quando houver;
- assinatura cromática;
- motion opcional.

### Diários
Cada Dia pode requerer:
- `hero`;
- `exercise-diagram`;
- `ritual-diagram`;
- `thumbnail`;
- `share-card`;
- `qr`;
- `audio-preset`;
- `motion` quando necessário.

Nem todo Dia precisa de todos os tipos.

## 3. Naming

```text
{scope}/{scope-id}/{kind}/v{version}/{slug}.{ext}
```

Exemplos:

```text
sephira/kether/hero/v1/kether-crown.webp
day/036/hero/v1/portal-kether-chokmah.webp
day/036/audio/v1/transition.json
cycle/achaiah/emblem/v1/achaiah.svg
```

## 4. Registry

Campos mínimos:

```yaml
id: day-036-hero
scope: day
scope_id: "036"
kind: hero
version: 1
status: draft
storage_path: "day/036/hero/v1/portal-kether-chokmah.webp"
source_tool: chatgpt-image
source_model: null
prompt_ref: "prompts/day-036-hero-v1.md"
reference_assets: []
checksum: null
license: project-generated
approved_by: null
approved_at: null
published_at: null
```

## 5. Estados

`draft` → `review` → `approved` → `published`

Alternativos:
- `rejected`
- `retired`

Somente `published` entra na experiência final do usuário.

## 6. Provenance

Para cada asset gerado por IA, guardar:
- ferramenta;
- modelo quando disponível;
- prompt/brief completo;
- imagens de referência autorizadas;
- data;
- parâmetros relevantes;
- edição posterior;
- checksum final.

Nunca depender de memória do chat para reproduzir um asset aprovado.

## 7. Formatos

### Raster
- WebP como padrão de entrega;
- PNG quando transparência/qualidade exigir;
- fonte de alta resolução preservada fora do bundle do app.

### Vetor
- SVG para sigilos, ícones, diagramas e elementos escaláveis.

### Motion
- Lottie/Rive quando o efeito puder ser vetorial;
- MP4/WebM somente quando rasterização for realmente necessária.

### 3D
- GLB/GLTF quando a Árvore 3D entrar em produção.

## 8. Kether Asset Set V1

Primeiro conjunto obrigatório:

### Fundacionais
- Kether key art;
- background Atziluth/Kether;
- node ativo da Árvore;
- Portal Kether → Chokmah;
- sete atributos;
- XP/Level HUD;
- scanner frame;
- player skin;
- journal shell.

### Ciclos de Kether
Um kit reutilizável para cada ciclo dos Dias 1–35.

### Dias 1–36
- 36 thumbnails;
- heroes somente onde agregarem valor real;
- diagramas prioritários para exercícios que dependam de geometria/postura/visualização;
- QR/deep-link para todos os 36 dias;
- presets de áudio somente quando o conteúdo exigir.

## 9. Regra de consistência

Um asset é rejeitado se:
- contradiz o conteúdo canônico;
- altera personagem/entidade sem instrução;
- introduz texto incorreto;
- usa símbolos não aprovados como se fossem canônicos;
- quebra o Visual Bible;
- não registra provenance suficiente.

## 10. Asset Factory

A Factory expõe adapters, por exemplo:

```text
asset request
  ↓
canonical brief
  ↓
adapter escolhido
  ├─ ChatGPT Image
  ├─ Adobe
  ├─ Figma
  ├─ Canva
  ├─ Higgsfield
  └─ futuro provider
  ↓
review
  ↓
approved
  ↓
Storage + Registry
```

A escolha do motor é decisão de produção, não parte da identidade do asset.
