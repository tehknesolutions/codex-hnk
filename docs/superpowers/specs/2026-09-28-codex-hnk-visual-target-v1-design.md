# CODEX HNK — Visual Target V1 Design

**Status:** CANON OFICIAL · aprovado em 2026-09-28  
**Canonical issue:** #342

## 1. North Star
O CODEX HNK deve ser percebido como um códice vivo e um artefato navegável, não como dashboard SaaS. Princípio supremo: **estrutura rígida por baixo; experiência viva por cima**.

## 2. Genealogia visual
| Referência | Responsabilidade canônica |
|---|---|
| Portal Cósmico / Sacred Editorial Fantasy | Visual North Star: home monumental, Kether–Chokhmah–Binah, Árvore, 705/26/365 |
| Próximo Passo / Codex Digital Místico | System North Star: tokens, materiais, tipografia, iconografia, motion, UI kit |
| O Salto Cósmico | Journey North Star: wireflow e estados de um Day |
| CODEX LAB 001 | Practice North Star: missão, objetivo, passos, regra, eventos, reflexão, conquistas |
| Colagem Cósmica | Mobile North Star: narrativa vertical |
| Mapa dos Sete Pilares | Knowledge North Star: pilares, matriz 7×7, Knowledge Graph |
| Henuvokodan | Language/Glyph North Star: HNK-40, operadores, portais, selos e cores-mãe |
| Vida Que Transforma | Identity reference: árvore, timeline, missão, atributos e quests |

Nenhuma imagem isolada é a aplicação inteira. Cada referência governa uma escala ou subsistema.

## 3. Escalas
**MACROCOSMO:** Home, Árvore HNK, Jornada, Henuvokodan, 7 Pilares, Matriz 7×7, Knowledge Graph, Biblioteca.  
**MESOCOSMO:** Day, portal, câmara, manuscrito, revelação, artefato, correspondências, Kavanah, escolha, quest, espelho, passagem.  
**MICROCOSMO:** preparação, objetivo, timer, eventos, retorno/foco, reflexão, registro, XP, conquista.

Fluxo canônico: `MACROCOSMO → MESOCOSMO → MICROCOSMO → TRANSFORMAÇÃO → RETORNO À ÁRVORE`.

## 4. Design DNA
Obsidiana/noite + ouro + luz + cosmos + geometria sagrada + manuscrito + arquitetura monumental.

Profundidade: `Cosmos → Arquitetura → Geometria → Artefato → Informação → Interação`.

O ouro representa estrutura, conexão, iluminação e interação; azul/índigo, profundidade e cosmos; violeta, Coroa/transcendência; pergaminho, conhecimento documentado.

## 5. SphereTheme
- **Kether 001–036:** ouro, ivory, amanhecer/celestial, fundação, coroa/círculo/eixo vertical.
- **Chokhmah 037–073:** azul celestial, prata, cosmos/expansão, radiância/onda/espiral.
- **Binah 074–109:** violeta real, ouro pálido, noite/arquitetura, estrutura, triângulo/vaso/contenção.

`SphereTheme` governa accent, glow, atmosphere, realm artwork, symbol, material e motion profile. Esfera não é uma simples troca de cor.

## 6. Sacred Portal Home
Primeira dobra: `CodexHeader + CodexIntro + KetherPortal + ChokhmahPortal + BinahPortal + HnkTree`. Portais são arquitetura vertical, não cards genéricos. Abaixo: faixa clara `705 LUX / 26 VERBUM / 365 OPERATIO`, seguida de destinos narrativos.

## 7. Chamber Engine
Contrato: `DayDefinition → ChamberRenderer → SphereTheme → UniqueManifestation`.

Anatomia-base: `Limiar → Chave → Atmosfera → Revelação → Manuscrito → Artefato → Descoberta → Kavanah → Escolha → Quest → Espelho → Passagem`.

Conteúdo canônico permanece separado da manifestação visual. Não criar 109 páginas artesanais independentes.

## 8. Practice Engine
LAB é identidade visual; wireflow é arquitetura funcional. Estados: `preparação → prática → prática ativa → conclusão → percepção → diário → recompensa → correspondências → próximo passo`.

## 9. Glyph Semantics
`Sigil != Ornament`. Tipos: `CanonicalGlyph`, `PortalGlyph`, `SphereGlyph`, `OperatorGlyph`, `DecorativeGeometry`, `Ornament`. Os quatro primeiros obedecem à taxonomia canônica HNK; os dois últimos são direção de arte.

## 10. Responsive Narrative Equivalence
Mobile não miniaturiza desktop. Deve preservar significado, sequência e estado, recompondo a narrativa verticalmente. Desktop privilegia monumentalidade; mobile privilegia progressão narrativa e ação.

## 11. Materials & rendering
SVG: glifos e geometria. AVIF/WebP: mundos e artwork. CSS: luz, atmosfera, vignette, grain e estados. HTML: todo conteúdo textual. A UI nunca será rasterizada em uma única imagem.

Camadas: cosmos → arquitetura → realm artwork → sigilos/luz → UI/conteúdo.

## 12. Motion
Vocabulário: emanação, respiração, resposta, impacto, transmutação. Movimento solene e lento; `prefers-reduced-motion` obrigatório. Evitar partículas frenéticas e neon indiscriminado.

## 13. Performance & accessibility
Hero assets < 1.5 MB; primeira dobra < 3 MB; below-fold lazy; AVIF/WebP; contraste AA; focus-visible; teclado; texto fora de imagens; touch targets >= 44px.

## 14. Component boundaries
`CodexShell`, `CodexHeader`, `CodexSearch`, `SacredPortalHome`, `SpherePortal`, `SphereSigil`, `HnkTree`, `SacredMetrics`, `CodexPortalGrid`, `ChamberShell`, `ChamberHero`, `ChamberManuscript`, `ChamberArtifact`, `ChamberPractice`, `ChamberVault`, `ChamberNavigation`, `PracticeEngine`, `Progression`, `CanonicalGlyph`, `ArchFrame`, `GoldRule`, `CornerOrnament`, `StarField`.

Data/config: `spheres.ts`, `days.ts`, `navigation.ts`, `visual-tokens.ts`, `glyph-registry.ts`.

## 15. Anti-patterns
Não usar dashboard SaaS, cards arredondados genéricos, glassmorphism em tudo, gradiente roxo/azul genérico, 109 páginas manuais, texto dentro de artwork, background único contendo a UI, neon excessivo ou ornamento sem função.

## 16. Visual acceptance order
Silhueta → grid → hierarquia → tipografia → arquitetura dos portais → art direction → Árvore → materialidade → ornamentação → motion → responsividade → performance.

Fidelidade é preservação de **hierarquia, monumentalidade, profundidade e sensação de códice navegável**, não contagem de elementos copiados.

## 17. Decomposition
1. Tokens + primitives semânticos.
2. CodexShell/navigation/search.
3. Sacred Portal Home.
4. SpherePortal + HnkTree + SacredMetrics.
5. Chamber Engine.
6. Practice Engine.
7. Progression/XP/achievements.
8. Knowledge/Pillars/Graph.
9. Henuvokodan/glyph registry.
10. Mobile narrative compositions.

Este documento e a issue #342 são a autoridade visual V1. Contradições exigem nova decisão canônica explícita.