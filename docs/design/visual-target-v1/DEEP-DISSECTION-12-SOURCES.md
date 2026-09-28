# CODEX-HNK — DISSECAÇÃO PROFUNDA DAS 12 IMAGENS-FONTE
## Visual Source Dissection V1 · Documento de Referência Canônica

**Repositório:** `tehknesolutions/codex-hnk`  
**Branch:** `docs/visual-source-dissection-v1`  
**Data:** 2026-09-28  
**Escopo:** 12 imagens fornecidas como fontes visuais do CODEX-HNK  
**Natureza:** análise visual, editorial, estrutural, de informação, interação e implementação

---

## 0. Regra de leitura

Este documento descreve **o que as imagens mostram e como esse material pode ser decomposto em um sistema digital**.

Ele não transforma automaticamente todo texto, número, símbolo ou afirmação visível nas imagens em verdade semântica do produto.

Há três níveis:

1. **Observação visual** — forma, composição, cor, hierarquia, texto visível, relações espaciais.
2. **Inferência de design** — componente, estado, fluxo ou regra que a composição sugere.
3. **Autoridade de produto** — contrato que precisa ser confirmado pelos documentos/código canônicos do CODEX.

Quando uma imagem contém texto gerado, nomenclatura experimental ou números que não possuem autoridade em outra fonte, este relatório preserva a presença visual sem elevá-la automaticamente a regra funcional.

---

# 1. INVENTÁRIO DAS 12 FONTES

| # | Fonte | Dimensão | Papel visual dominante |
|---|---|---:|---|
| 01 | Codex HNK: Mapa dos Sete Pilares | 1536×1024 | mapa de conhecimento / matriz |
| 02 | Painel Cósmico do Codex HNK | 1536×1024 | home / macrocosmo |
| 03 | Codex HNK: Vida Que Transforma | 1536×1024 | dossiê pessoal / árvore / legado |
| 04 | Codex Lab 001: A Coroa Antes da Forma(3) | 1055×1491 | prática vertical / missão |
| 05 | Portal Cósmico do Codex HNK | 1536×1024 | hero / portal editorial |
| 06 | Codex Lab 001: A Coroa Antes da Forma(2) | 1055×1491 | prática vertical / jornada |
| 07 | Codex Lab 001: A Coroa Antes da Forma(1) | 1055×1491 | prática vertical / estados |
| 08 | Codex Lab 001: A Coroa Antes da Forma | 1055×1491 | prática vertical / versão-base |
| 09 | Codex Digital: O Salto Cósmico | 1536×1024 | wireframe visual do Day |
| 10 | Codex Místico Henuvokodan: Árvore e Portais Dourados | 1312×1199 | sistema linguístico / árvore / portais |
| 11 | Colagem Cósmica do Codex HNK | 1024×1536 | jornada completa / onboarding |
| 12 | Próximo Passo: Codex Digital Místico | 1536×1024 | design system / fluxo / anatomia |

Todos os arquivos são RGB PNG. Os hashes exatos estão no manifesto do pacote visual.

---

# 2. ARQUITETURA VISUAL GLOBAL

As 12 imagens não funcionam como 12 telas independentes. Em conjunto, elas formam um sistema em camadas:

```
IDENTIDADE
    ↓
MACROCOSMO
    ↓
MAPA / ÁRVORE / DOMÍNIOS
    ↓
PORTAL
    ↓
DAY / CÂMARA
    ↓
PRÁTICA
    ↓
REGISTRO
    ↓
CORRESPONDÊNCIAS
    ↓
RECOMPENSA
    ↓
PROGRESSÃO
    ↓
RETORNO À ÁRVORE
```

Há cinco escalas principais:

### Escala A — Mundo
Painel Cósmico, Portal Cósmico, Mapa dos Sete Pilares.

### Escala B — Identidade
Vida Que Transforma.

### Escala C — Sistema
Henuvokodan e Próximo Passo.

### Escala D — Experiência
Codex Digital, Colagem/Jornada.

### Escala E — Operação
As quatro versões do Codex Lab 001.

Isso sugere uma arquitetura de produto na qual **Home, Knowledge Graph, Day, Practice e Progression são modos do mesmo sistema**, não produtos visuais separados.

---

# 3. IMAGEM 01 — MAPA DOS SETE PILARES

## 3.1 Composição

A imagem apresenta uma interface em torno de um grande livro aberto.

No centro da página esquerda existe um diagrama HNK com sete nós/pilares coloridos, organizados radialmente ao redor de um núcleo.

Na página direita aparece uma matriz colorida de relações, acompanhada de estatísticas.

A composição possui:

- header horizontal;
- sidebar esquerda;
- conteúdo principal de livro aberto;
- controles/tabulação;
- sidebar direita;
- rodapé/search;
- elementos ornamentais físicos;
- iluminação cinematográfica.

## 3.2 Hierarquia

Ordem perceptiva:

1. livro aberto;
2. núcleo HNK;
3. sete pilares;
4. matriz de relações;
5. título/mapa;
6. estatísticas;
7. navegação lateral;
8. decoração física.

O livro é o **container semântico visual**.

## 3.3 Componentes inferidos

```
KnowledgeMapPage
├── CodexHeader
├── PrimarySidebar
├── CodexBook
│   ├── BookLeftPage
│   │   ├── MapTitle
│   │   ├── PillarWheel
│   │   └── PillarNode[]
│   └── BookRightPage
│       ├── KnowledgeMatrix
│       ├── MatrixTabs
│       └── KnowledgeStats
├── SecondaryRail
└── CodexSearchFooter
```

## 3.4 Dados

O diagrama sugere que cada pilar precisa ser um objeto de dados, não uma imagem:

```ts
Pillar {
  id
  name
  shortLabel
  color
  glyph
  description
  domains[]
  relationships[]
}
```

A matriz sugere uma segunda estrutura:

```ts
KnowledgeRelation {
  source
  target
  strength
  category
  evidence
}
```

## 3.5 Visual tokens

- parchment surface;
- ink typography;
- gold rules;
- jewel-color nodes;
- dark surrounding shell;
- physical book shadow;
- engraved ornaments.

## 3.6 Implementação

A matriz deve ser HTML/SVG/Canvas conforme necessidade de interação.

O livro pode ser uma composição CSS com imagens de textura, mas o texto e os nós precisam permanecer DOM/SVG para acessibilidade e busca.

## 3.7 Critério de fidelidade

Preservar:

**livro → mapa → relações → estatísticas**

Não transformar em uma grade genérica de cards.

---

# 4. IMAGEM 02 — PAINEL CÓSMICO DO CODEX HNK

## 4.1 Papel

É a referência mais densa para a homepage/macrocósmico.

A composição mostra uma grande interface com:

- sidebar esquerda;
- header;
- intro editorial;
- três grandes esferas;
- árvore HNK;
- métricas;
- quatro portais;
- módulos inferiores;
- progressão/jornada.

## 4.2 Estrutura macro

```
CODEX HOME
├── GlobalHeader
├── LeftRail
├── HeroMacrocosm
│   ├── EditorialIntro
│   ├── Kether
│   ├── Chokhmah
│   ├── Binah
│   └── HNKTree
├── SacredMetrics
├── PortalGrid
│   ├── Folio
│   ├── Journey
│   ├── Library
│   └── Henuvokodan
└── OperationalModules
```

## 4.3 Editorial intro

O texto "HNK Sacred Editorial Fantasy" funciona visualmente como declaração de linguagem.

Não é apenas um título.

É um **manifesto de direção de arte**:

- editorial;
- monumental;
- fantástico;
- contemplativo;
- tecnológico;
- codex-like.

## 4.4 Tríade

Kether, Chokhmah e Binah funcionam como três grandes portais visuais.

Cada um tem:

- cor dominante;
- sigilo;
- título;
- range;
- artwork;
- microdescrição;
- CTA.

Isso indica um componente parametrizado:

```
SpherePortal(theme, title, range, artwork, copy, state)
```

## 4.5 Árvore

A árvore no lado direito funciona como contraponto estrutural às imagens.

O conteúdo é radial/celestial; a árvore fornece orientação.

Isso produz:

**imersão + orientação**.

## 4.6 Métricas

A faixa clara 705 / 26 / 365 funciona como pausa visual.

É importante porque cria contraste entre:

- cosmos escuro;
- manuscrito claro;
- cosmos escuro.

Esse padrão pode virar um componente `SacredMetrics`.

## 4.7 Portal grid

Os quatro cards são mais editoriais que comerciais.

Cada um tem:

- artwork;
- title;
- subtitle;
- microcopy;
- arrow;
- grande área clicável.

O componente não deve virar card SaaS arredondado.

## 4.8 Módulos inferiores

A faixa inferior mostra que a home também pode funcionar como **dashboard de jornada**, apresentando exemplos de:

- Câmara;
- LAB;
- mapa;
- árvore;
- jornada mobile.

Esses módulos devem ser tratados como demonstrações/atalhos, não necessariamente como conteúdo fixo da home.

---

# 5. IMAGEM 03 — VIDA QUE TRANSFORMA

## 5.1 Papel

É um dossiê de identidade pessoal.

A imagem combina:

- retrato;
- dados pessoais;
- identidade em camadas;
- atributos;
- árvore da vida pessoal;
- linha do tempo;
- missão;
- classe;
- princípios;
- sigilo;
- elementos simbólicos.

## 5.2 Estrutura

```
PersonalCodex
├── IdentityHero
├── PersonalData
├── IdentityLayers
├── AttributeSheet
├── AttributeRadar
├── PersonalTree
├── Timeline
├── MissionPanel
├── ClassPanel
├── Principles
├── MasterSigil
└── SymbolLegend
```

## 5.3 Insight de produto

Esta imagem demonstra que o CODEX pode representar um usuário não apenas como "perfil", mas como **objeto narrativo estruturado**.

Isso não significa que todos os dados mostrados devam ser coletados ou expostos automaticamente.

A arquitetura correta é separar:

- dados pessoais;
- dados derivados;
- escolhas do usuário;
- interpretação;
- elementos simbólicos;
- conteúdo narrativo.

## 5.4 Radar

O radar visual sugere atributos multidimensionais.

O componente deve aceitar:

```
attribute.id
attribute.current
attribute.potential
attribute.function
```

Mas qualquer algoritmo que produza esses valores deve ser uma camada separada do visual.

## 5.5 Timeline

A linha 2026–2035 é um excelente padrão de timeline visual.

Pode virar:

```
Timeline
├── YearNode
├── Phase
├── Milestone
└── Description
```

O destaque de um ano é um estado, não uma imagem.

## 5.6 Princípio

**O dossiê é uma visualização; não deve ser o banco de dados.**

---

# 6. IMAGENS 04, 06, 07 E 08 — AS QUATRO VERSÕES DO CODEX LAB 001

Estas quatro imagens devem ser estudadas juntas.

Elas são variações do mesmo conceito:

**"A Coroa Antes da Forma".**

## 6.1 O que permanece

Todas preservam:

- formato vertical;
- grande título;
- missão;
- personagem/forma humana central;
- luz/coroa;
- painel de objetivo;
- passos;
- regra;
- eventos;
- checklist;
- conquistas;
- identidade CODEX.

Portanto existe um núcleo funcional consistente.

## 6.2 O que muda

As versões exploram diferentes tratamentos para:

- densidade;
- centralidade;
- quantidade de texto;
- ornamentação;
- distribuição dos painéis;
- intensidade de glow;
- posição dos eventos;
- representação do macro/microcosmo;
- rodapé/progresso.

Isso é evidência de **exploração visual**, não de quatro produtos diferentes.

## 6.3 Anatomia comum

```
PracticeMission
├── MissionHeader
├── MissionIdentity
├── Objective
├── Steps[]
├── Rule
├── PossibleEvents[]
├── ActivePractice
├── ReflectionChecklist
├── Rewards
├── Achievements[]
└── Continue
```

## 6.4 Estado funcional implícito

As imagens mostram um ciclo:

```
PREPARAR
↓
ACENDER
↓
PRATICAR
↓
PERCEBER
↓
REGISTRAR
↓
CONQUISTAR
↓
CONTINUAR
```

## 6.5 Insight decisivo

O conteúdo central deve ser **HTML/React real**.

A arte da pessoa meditando, planetas e cosmos é camada visual.

O timer, checklist, XP, eventos e CTA são estado funcional.

Nunca achatar tudo em uma imagem.

## 6.6 Design tokens

As quatro versões mostram uma paleta recorrente:

- ouro;
- azul;
- violeta;
- ciano;
- verde;
- vermelho;
- branco;
- preto/azul profundo.

As cores parecem funcionar semântica e hierarquicamente:

- ouro = principal/sagrado;
- azul = foco/estrutura;
- violeta = contemplação;
- verde = objetivo/evento positivo;
- vermelho = regra/alerta;
- ciano = sistema/energia.

Essas relações devem ser transformadas em tokens configuráveis, não em valores espalhados pelo CSS.

---

# 7. IMAGEM 05 — PORTAL CÓSMICO

## 7.1 Papel

É uma versão mais limpa e monumental da primeira dobra.

Comparada ao Painel Cósmico, ela reduz a densidade operacional e aumenta:

- escala;
- foco;
- respiro;
- impacto editorial.

## 7.2 Composição

```
Header
↓
EditorialIntro + ThreeSpheres + HNKTree
↓
SacredMetrics
↓
FourNarrativePortals
```

## 7.3 Função

Essa composição é particularmente adequada como:

- landing/home;
- estado inicial;
- apresentação do sistema;
- portal de entrada.

O Painel Cósmico é mais denso.

O Portal Cósmico é mais cinematográfico.

Isso sugere dois modos legítimos:

**Portal Mode** e **Operational Mode**.

---

# 8. IMAGEM 09 — CODEX DIGITAL: O SALTO CÓSMICO

## 8.1 Papel

É uma especificação visual de um Day.

A imagem é praticamente um storyboard operacional.

Ela apresenta 18 etapas numeradas.

## 8.2 Fluxo

A sequência mostra:

```
01 O Vazio
→ 02 A Resposta
→ 03 Aleph sem Palavra
→ 04 O Título
→ 05 A Travessia
→ 06 A Câmara
→ 07 A Revelação
→ 08 O Artefato
→ 09 A Kavanah
→ 10 A Intenção
→ 11 O Contrato
→ 12 O Selo
→ 13 O Diário
→ 14 A Quest
→ 15 A Recompensa
→ 16 A Árvore
→ 17 A Passagem
→ 18 O Átrio
```

## 8.3 Insight arquitetural

Esta imagem fornece evidência visual muito forte para um **Chamber/Day Engine data-driven**.

Não devemos construir 109 páginas manualmente.

Devemos construir:

```
DayDefinition
→ StepRenderer
→ StepType
→ State
→ Navigation
```

## 8.4 Estados

O painel lateral do design system mostra estados:

- dormant;
- perceived;
- active;
- revealed;
- acquired.

Esses estados são excelentes candidatos a enum de UI.

## 8.5 Materiais

O design system da imagem explicita:

- luz emanante;
- metal sacro;
- pergaminho;
- vidro etéreo;
- pedra celeste.

Isso deve alimentar tokens de material.

---

# 9. IMAGEM 10 — HENUVOKODAN / ÁRVORE E PORTAIS

## 9.1 Papel

É um atlas linguístico/simbólico.

A imagem apresenta:

- proglifos sefiroticos;
- árvore;
- quatro mundos;
- fonemas;
- operadores;
- portais;
- selos;
- cores;
- faces de portal;
- círculo HNK-72.

## 9.2 Estrutura

```
LanguageAtlas
├── IdentityHeader
├── SephiroticGlyphRegistry
├── HNKTree
├── FourWorlds
├── PhonemeTable
├── OperatorTable
├── PortalTable
├── SealTable
├── ColorRegistry
├── PortalFaces
└── HNK72Circle
```

## 9.3 Insight

Esta imagem é especialmente importante porque diferencia:

**glyph ≠ decoration.**

Os símbolos possuem função visual/semântica dentro do sistema.

Logo:

```
CanonicalGlyph
PortalGlyph
OperatorGlyph
DecorativeOrnament
```

devem ser classes diferentes.

## 9.4 Registro

O produto precisa de um registry:

```
glyph-registry
├── id
├── type
├── name
├── source
├── visual
├── semanticStatus
└── usage
```

## 9.5 Cores

A faixa de cores-mãe sugere um registro de cor associado a portais.

Não tratar essas cores apenas como decoração.

---

# 10. IMAGEM 11 — COLAGEM CÓSMICA / CODEX INTERATIVO 365

## 10.1 Papel

É a imagem mais explícita sobre **jornada completa**.

Ela mostra 15 módulos/etapas:

1. Boas-vindas
2. Antes de tudo
3. Sua experiência
4. Sua âncora
5. Day 001
6. Preparando o templo
7. A prática
8. Prática em andamento
9. Prática concluída
10. O que aconteceu?
11. Espelho da alma
12. Recompensa
13. Correspondências
14. O que vem depois?
15. Sua jornada

## 10.2 Arquitetura

```
Onboarding
→ Context
→ Personalization
→ Day Entry
→ Preparation
→ Active Practice
→ Completion
→ Reflection
→ Reward
→ Correspondences
→ Next Step
→ Progression
```

## 10.3 Insight

A imagem praticamente define o **funnel narrativo do usuário**.

Mas "funnel" aqui não significa marketing.

É um fluxo de experiência.

## 10.4 Dados necessários

```
JourneySession
├── userContext
├── day
├── anchor
├── preparation
├── practiceState
├── reflection
├── reward
├── correspondences
└── nextAction
```

## 10.5 Mobile

A própria colagem favorece uma leitura vertical/card-by-card.

Isso reforça:

**mobile = recomposição narrativa**, não simplesmente desktop comprimido.

---

# 11. IMAGEM 12 — PRÓXIMO PASSO / DESIGN SYSTEM

## 11.1 Papel

É a imagem mais próxima de um design-system board.

Ela reúne:

- paleta;
- tipografia;
- iconografia;
- texturas;
- geometria;
- tríptico Day 1/183/365;
- interação;
- motion;
- anatomia da página;
- fluxo;
- componentes;
- XP;
- atributos;
- diário;
- princípio supremo.

## 11.2 Valor arquitetural

Esta imagem deve ser tratada como **ponte entre arte e engenharia**.

Ela traduz:

```
DIREÇÃO DE ARTE
↓
TOKENS
↓
COMPONENTES
↓
INTERAÇÃO
↓
MOTION
↓
FLUXO
```

## 11.3 Motion

Os cinco movimentos indicados formam um vocabulário:

- emanação;
- respiração;
- resposta;
- impacto;
- transmutação.

Isso permite criar uma API de motion em vez de animações aleatórias.

## 11.4 Anatomia da página

Os 12 movimentos/etapas são:

- limiar;
- chave;
- atmosfera;
- revelação;
- manuscrito;
- artefato;
- descoberta;
- kavanah;
- escolha;
- quest;
- espelho;
- passagem.

Esse conjunto deve virar configuração do Chamber Engine.

---

# 12. COMPARAÇÃO CRUZADA DAS 12 IMAGENS

## 12.1 O que é recorrente

### Estrutura

- moldura;
- header;
- navegação;
- painel central;
- sidebar/rail;
- CTA;
- progressão.

### Forma

- círculo;
- triângulo;
- hexágono;
- árvore;
- estrela;
- sigilo;
- livro;
- portal.

### Material

- ouro;
- pergaminho;
- pedra;
- vidro;
- cosmos;
- metal;
- luz.

### Informação

- título;
- subtítulo;
- microcopy;
- estado;
- progresso;
- recompensa;
- relação;
- navegação.

---

# 13. TAXONOMIA VISUAL

## 13.1 Containers

```
CodexFrame
SacredPanel
ManuscriptPanel
ArtifactCard
PortalCard
MissionPanel
StatsPanel
TimelinePanel
```

## 13.2 Navigation

```
CodexHeader
PrimaryRail
SecondaryRail
Breadcrumb
PortalCTA
NextAction
BackAction
Search
```

## 13.3 Symbolic

```
CanonicalGlyph
PortalGlyph
SphereGlyph
OperatorGlyph
TreeNode
Sigil
Seal
```

## 13.4 Experience

```
DayHeader
StepCard
PracticeTimer
EventSelector
ReflectionForm
RewardCard
Achievement
CorrespondenceMap
JourneyProgress
```

---

# 14. DESIGN TOKENS PROPOSTOS

## 14.1 Color roles

```
--codex-obsidian
--codex-night
--codex-gold
--codex-gold-hot
--codex-ivory
--codex-parchment
--codex-blue
--codex-cyan
--codex-violet
--codex-green
--codex-red
--codex-ink
```

Os valores exatos devem ser extraídos/normalizados durante a implementação. As imagens estabelecem relações visuais, não necessariamente um único RGB oficial.

## 14.2 Surface roles

```
surface.cosmic
surface.manuscript
surface.panel
surface.artifact
surface.overlay
surface.active
```

## 14.3 Border roles

```
border.gold
border.goldSubtle
border.active
border.focus
border.semantic
```

## 14.4 Typography roles

```
displaySacred
displayEditorial
headingSystem
bodyEditorial
bodySystem
labelUpper
caption
numeric
glyph
```

## 14.5 Glow roles

```
glow.gold
glow.blue
glow.violet
glow.cyan
glow.green
glow.warning
```

---

# 15. SISTEMA DE MATERIAIS

As imagens estabelecem uma biblioteca de materiais recorrentes.

### Pergaminho
Uso: manuscritos, livros, métricas, documentos.

### Ouro
Uso: hierarquia, CTA primário, borda canônica, luz, sigilo.

### Obsidiana
Uso: shell, navegação, fundo.

### Vidro/cosmos
Uso: portais, overlays, estados energéticos.

### Pedra
Uso: arquitetura, montanhas, mundo físico.

### Metal
Uso: molduras, artefatos, controles.

A implementação deve separar:

**material visual** de **componente funcional**.

---

# 16. SISTEMA DE PROFUNDIDADE

As imagens recorrentes sugerem uma pilha de aproximadamente 6 planos:

```
Z0 — fundo cósmico
Z1 — arquitetura / cenário
Z2 — artwork principal
Z3 — geometria / sigilos
Z4 — partículas / glow
Z5 — UI / texto / interação
```

A UI não deve ser incorporada permanentemente ao Z2.

Isso permite:

- responsividade;
- acessibilidade;
- hover;
- animação;
- troca de conteúdo;
- tradução;
- dados reais.

---

# 17. SISTEMA DE FRAMES

O frame é uma assinatura visual importante.

Elementos:

- linha dourada;
- cantos;
- filigrana;
- separadores;
- círculos;
- microestrelas;
- símbolos.

Criar como primitives:

```
CodexFrame
FrameCorner
GoldRule
SacredDivider
ArtifactBorder
ManuscriptEdge
```

---

# 18. SISTEMA DE ICONOGRAFIA

A iconografia possui três fontes distintas:

### Semântica
ícone comunica uma função.

### Simbólica
glifo pertence ao universo HNK.

### Decorativa
ornamento cria atmosfera.

Nunca misturar os três sem intenção.

---

# 19. SISTEMA DE MOTION

## Emanação

Entrada lenta de luz.

## Respiração

Escala/opacidade sutil e cíclica.

## Resposta

Feedback direto ao gesto.

## Impacto

Transição rápida e pontual.

## Transmutação

Mudança de estado mais profunda.

Cada motion deve ter:

```
duration
easing
distance
opacity
scale
glow
reducedMotionBehavior
```

---

# 20. RESPONSIVIDADE

As fontes mostram dois mundos:

### Desktop

- monumental;
- múltiplas colunas;
- sidebars;
- composição panorâmica;
- grande artwork.

### Mobile

A colagem mostra cards sequenciais.

Logo:

```
Desktop:
world → navigation → composition

Mobile:
story → action → state → next
```

Não reduzir simplesmente todos os elementos em escala.

---

# 21. ACESSIBILIDADE

A decomposição implica:

- texto real fora de imagens;
- headings semânticos;
- aria-label para símbolos interativos;
- foco visível;
- keyboard navigation;
- touch targets adequados;
- reduced motion;
- contraste;
- alt text;
- leitura linear coerente.

Especialmente importante: **glifos decorativos não devem ser anunciados pelo leitor de tela**.

Glifos funcionais precisam de nome acessível.

---

# 22. PERFORMANCE

As fontes são visualmente pesadas e cada PNG tem aproximadamente 2–3 MB.

Não usar todos os PNGs simultaneamente na primeira dobra.

Estratégia:

```
Hero
→ preload apenas do essencial

Below fold
→ lazy load

Large artwork
→ AVIF/WebP derivado

Glyph/geometry
→ SVG

Texture
→ compressed CSS/image asset

UI
→ DOM/SVG
```

O PNG original permanece como **source of truth**, não necessariamente como formato final de produção.

---

# 23. ANTI-PATTERNS DERIVADOS DAS FONTES

Não fazer:

- transformar o Codex em SaaS genérico;
- substituir pergaminho por cards cinza;
- remover a monumentalidade;
- usar glassmorphism indiscriminado;
- aplicar neon sem hierarquia;
- colocar toda a UI dentro de uma única imagem;
- fazer 109 layouts diferentes;
- criar glifos aleatórios;
- tratar todos os símbolos como ícones;
- usar animação contínua em tudo;
- tornar o texto ilegível para preservar estética.

---

# 24. ARQUITETURA DE COMPONENTES

```
CodexShell
├── CodexHeader
├── CodexRail
├── CodexSearch
├── PortalHome
│   ├── EditorialIntro
│   ├── SpherePortal[]
│   ├── HnkTree
│   ├── SacredMetrics
│   └── PortalGrid
├── KnowledgeMap
│   ├── PillarWheel
│   ├── KnowledgeMatrix
│   └── KnowledgeStats
├── PersonalCodex
│   ├── IdentityHero
│   ├── AttributeSheet
│   ├── PersonalTree
│   ├── Timeline
│   └── MissionPanel
├── DayEngine
│   ├── DayHeader
│   ├── ChamberRenderer
│   ├── StepRenderer
│   └── DayNavigation
├── PracticeEngine
│   ├── Preparation
│   ├── ActivePractice
│   ├── Events
│   ├── Reflection
│   └── Completion
├── CorrespondenceEngine
├── ProgressionEngine
└── GlyphSystem
```

---

# 25. DADOS

A camada visual deve consumir dados.

## Sphere

```ts
SphereDefinition
```

## Day

```ts
DayDefinition
```

## Chamber

```ts
ChamberStepDefinition
```

## Practice

```ts
PracticeDefinition
```

## Glyph

```ts
GlyphDefinition
```

## Journey

```ts
JourneyState
```

## User

```ts
CodexProfile
```

---

# 26. RELAÇÃO ENTRE AS FONTES

| Fonte | Alimenta |
|---|---|
| Mapa dos Sete Pilares | Knowledge Map |
| Painel Cósmico | Portal Home / Macrocosm |
| Vida Que Transforma | Personal Codex |
| Lab 001 (4 versões) | Practice Engine |
| Portal Cósmico | Landing / Portal Mode |
| Salto Cósmico | Day/Chamber Engine |
| Henuvokodan | Glyph / Language System |
| Colagem Cósmica | Journey / Onboarding |
| Próximo Passo | Design System / Interaction System |

---

# 27. CONVERGÊNCIA

As 12 imagens convergem para uma única arquitetura:

```
CODEX SHELL
    ↓
PORTAL
    ↓
TREE / MAP
    ↓
DAY
    ↓
CHAMBER
    ↓
PRACTICE
    ↓
REFLECTION
    ↓
REWARD
    ↓
CORRESPONDENCE
    ↓
PROGRESSION
    ↓
TREE
```

O sistema é circular.

A experiência não termina em uma página de conclusão.

Ela retorna ao sistema maior.

---

# 28. FONTE VISUAL VS IMPLEMENTAÇÃO

A regra de implementação deve ser:

```
IMAGE
  ↓
OBSERVATION
  ↓
SEMANTIC COMPONENT
  ↓
DATA CONTRACT
  ↓
INTERACTION
  ↓
STATE
  ↓
RESPONSIVE COMPOSITION
```

Nunca:

```
IMAGE
  ↓
BACKGROUND-IMAGE
  ↓
DONE
```

---

# 29. MATRIZ DE FIDELIDADE

Toda implementação visual deve ser avaliada em ordem:

1. Silhueta.
2. Grid.
3. Proporção.
4. Hierarquia.
5. Espaço negativo.
6. Tipografia.
7. Paleta.
8. Materialidade.
9. Geometria.
10. Iconografia.
11. Motion.
12. Responsividade.
13. Acessibilidade.
14. Performance.

Uma implementação pode ter cores corretas e ainda falhar visualmente se perder a silhueta ou a hierarquia.

---

# 30. CHECKLIST DE IMPLEMENTAÇÃO

## Shell
- [ ] Header
- [ ] Rail
- [ ] Search
- [ ] Theme
- [ ] Identity

## Portal
- [ ] Editorial intro
- [ ] Kether
- [ ] Chokhmah
- [ ] Binah
- [ ] Tree
- [ ] Metrics
- [ ] Portal cards

## Knowledge
- [ ] Seven Pillars
- [ ] Matrix
- [ ] Statistics
- [ ] Graph

## Personal
- [ ] Identity
- [ ] Attributes
- [ ] Radar
- [ ] Timeline
- [ ] Mission
- [ ] Sigil

## Day
- [ ] Limiar
- [ ] Chave
- [ ] Atmosfera
- [ ] Revelação
- [ ] Manuscrito
- [ ] Artefato
- [ ] Descoberta
- [ ] Kavanah
- [ ] Escolha
- [ ] Quest
- [ ] Espelho
- [ ] Passagem

## Practice
- [ ] Preparation
- [ ] Timer
- [ ] Active state
- [ ] Events
- [ ] Reflection
- [ ] Reward
- [ ] Achievement
- [ ] Continue

## System
- [ ] Glyph registry
- [ ] Materials
- [ ] Tokens
- [ ] Motion
- [ ] Responsive
- [ ] Accessibility
- [ ] Performance

---

# 31. GATES VISUAIS

Antes de considerar o Visual Target V1 implementado:

### Gate 01 — Source
Todas as 12 fontes preservadas e hash-locked.

### Gate 02 — Structure
Componentes correspondem à decomposição.

### Gate 03 — Semantics
Texto e estado não estão presos ao artwork.

### Gate 04 — Responsive
Desktop e mobile preservam o mesmo significado.

### Gate 05 — Interaction
CTA, árvore, portais, prática e progressão funcionam.

### Gate 06 — Glyph
Nenhum glifo canônico foi substituído arbitrariamente.

### Gate 07 — Accessibility
Keyboard, focus, contrast, alt, reduced motion.

### Gate 08 — Performance
Artwork otimizado e lazy loading.

### Gate 09 — Visual
Silhueta, hierarquia, materialidade e composição preservadas.

### Gate 10 — Production
CI verde e deploy remoto validado.

---

# 32. DECISÕES DE ARQUITETURA DERIVADAS

1. O CODEX precisa de um **Design Token Layer**.
2. Precisa de um **Canonical Glyph Registry**.
3. Precisa de um **Sphere Theme System**.
4. Precisa de um **Day/Chamber Engine**.
5. Precisa de um **Practice Engine**.
6. Precisa de um **Journey/Progression Engine**.
7. Precisa de um **Knowledge Map/Graph Layer**.
8. Precisa de uma biblioteca de **Codex Primitives**.
9. Precisa de uma política explícita de **source-of-truth**.
10. Precisa de gates visuais automatizáveis.

---

# 33. O QUE AS IMAGENS NÃO DEFINEM SOZINHAS

As imagens não são suficientes para definir:

- banco de dados;
- autenticação;
- regras de autorização;
- algoritmo de XP;
- cálculo de atributos;
- semântica definitiva de todos os números;
- conteúdo definitivo dos 109 Days;
- comportamento real dos exercícios;
- critérios clínicos;
- analytics;
- infraestrutura;
- contratos de API.

Esses elementos precisam permanecer em suas respectivas autoridades documentais/código.

---

# 34. RESULTADO FINAL DA DISSECAÇÃO

As 12 imagens formam um único vocabulário visual:

**COSMOS + CODEX + MANUSCRITO + GEOMETRIA + PORTAL + ÁRVORE + PRÁTICA + JORNADA.**

O objetivo de implementação não é reproduzir 12 imagens.

É reconstruir o **sistema que poderia gerar essas 12 imagens de forma coerente**.

A fórmula de implementação é:

```
SOURCE ART
    +
DESIGN TOKENS
    +
CANONICAL GLYPHS
    +
DATA MODELS
    +
COMPONENT PRIMITIVES
    +
STATE MACHINES
    +
RESPONSIVE COMPOSITION
    +
MOTION LANGUAGE
    =
CODEX HNK DIGITAL
```

## Princípio operacional

**Estrutura rígida por baixo.  
Experiência viva por cima.**

---

# 35. PRÓXIMA ETAPA

A próxima implementação deve ser feita por decomposição incremental:

```
Fase 1
SOURCE + TOKENS + PRIMITIVES

Fase 2
PORTAL HOME

Fase 3
TREE / KNOWLEDGE MAP

Fase 4
DAY / CHAMBER ENGINE

Fase 5
PRACTICE ENGINE

Fase 6
JOURNEY / PROGRESSION

Fase 7
GLYPH / HENUVOKODAN

Fase 8
PERSONAL CODEX

Fase 9
VISUAL QA

Fase 10
CI + DEPLOY
```

Nenhuma fase deve substituir a fonte visual; cada fase deve aproximar o produto da estrutura que as 12 imagens demonstram.
