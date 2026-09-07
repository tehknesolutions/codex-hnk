# HNK KETHER — FREEZE V1

**Status:** PRODUCT BASELINE FROZEN  
**Scope:** Capítulo 1 — Kether, Dias 001–036  
**World:** Atziluth  
**Entry grade:** Level 1 — Neófito  
**Exit grade:** Level 2 — Iniciado, somente após o Portal 036  
**Canonical source:** `Tehkne-Solutions/hnk-codex-365`  
**Product repository:** `Tehkne-Solutions/codex-hnk-app`

> Este documento congela a arquitetura, linguagem visual, experiência e fronteiras do primeiro vertical slice. Ele NÃO transforma referências editoriais pendentes, assets não aprovados ou protótipos em cânone.

---

## 1. DECISÃO CENTRAL

Kether é o primeiro produto completo do HNK Codex Digital.

O Capítulo 2 não dirige novas decisões de arquitetura até Kether funcionar de ponta a ponta como vertical slice real.

A separação de responsabilidades permanece obrigatória:

```text
hnk-codex-365
  = texto canônico + metadados editoriais + HNK-EP + XP

codex-hnk-app
  = experiência + progressão + áudio + assets + diário + QR + interfaces
```

Nenhuma camada de produto pode reescrever silenciosamente o conteúdo canônico.

---

## 2. O QUE ESTÁ CONGELADO

### Conteúdo-base
- Kether = Dias 001–036;
- Mundo = Atziluth;
- entrada = Level 1 / Neófito;
- Portal 036 = única promoção Kether → Chokmah;
- saída = Level 2 / Iniciado;
- sete atributos canônicos: `HIP`, `VNT`, `PER`, `SIN`, `BIO`, `INT`, `DIS`;
- `EQU` permanece métrica derivada, nunca oitavo atributo;
- conteúdo diário vem exclusivamente do repositório canônico.

### Arquitetura de experiência
- Dias 001–035 organizados em sete ciclos de cinco dias;
- sete Fragmentos da Coroa derivados de conclusões canônicas;
- Coroa 7/7 desbloqueia o Portal 036, mas não promove sozinha;
- revisit não duplica XP nem fragmentos;
- Day state base: `LOCKED → AVAILABLE → ACTIVE → EVIDENCE_PENDING → COMPLETE`;
- Portal 036 é boss/rito de passagem e não uma página diária comum;
- conclusão do Portal desbloqueia Chokmah sem iniciar automaticamente o Dia 037.

### Experiência diária
Fluxo-base:

```text
Limiar
→ Chave
→ Atmosfera
→ Revelação
→ Manuscrito
→ Artefato
→ Descoberta
→ Kavanah
→ Escolha
→ Quest
→ Espelho
→ Passagem
```

Os 12 movimentos são gramática de experiência, não template mecânico obrigatório em todas as telas.

### Arquétipos de interface
Registry de 12 arquétipos:

1. Portal
2. Manuscrito
3. Mapa
4. Artefato
5. Laboratório
6. Oráculo
7. Quest
8. Espelho
9. Revelação
10. Boss
11. Consagração
12. Transmutação

Cada Dia usa apenas os arquétipos necessários ao conteúdo.

---

## 3. DIREÇÃO VISUAL CONGELADA

Nome oficial da direção de Kether V1:

**HNK SACRED EDITORIAL FANTASY**

Definição:

> um sistema operacional iniciático contemporâneo apresentado como códice vivo, publicação editorial premium e artefato sagrado navegável.

Não é:
- template esotérico genérico;
- SaaS preto com bordas douradas;
- HUD RPG genérico;
- cópia visual de Harry Potter ou outra propriedade existente;
- fantasia decorativa que prejudica uso diário.

É:
- Renascimento + manuscrito cabalístico + revista editorial de luxo;
- fantasia cinematográfica original HNK;
- geometria sagrada funcional;
- tecnologia ancestral impossível;
- matéria, luz e interface trabalhando como um único sistema.

### Kether
Kether deve permanecer o mais cosmogônico dos capítulos:
- vazio fértil;
- negro profundo;
- ponto de luz;
- coroa/origem;
- geometria primordial;
- ouro como material/luz, não amarelo decorativo;
- partículas mínimas;
- silêncio visual;
- complexidade emanando progressivamente.

Regra: **menos em Kether significa cosmogonia, não minimalismo genérico.**

---

## 4. GRID, NUMEROLOGIA E GEOMETRIA

- grid principal: 12 colunas;
- unidade conceitual: 12;
- ritmos derivados de 3, 6, 12, 24, 36 e 72;
- matriz editorial 705 permanece rígida sob a superfície;
- 705 → 7+0+5 = 12 → 3, usado como ponte entre estrutura editorial invisível e experiência visível;
- triade interna: Expansão / Fricção / Convergência;
- a tríade NÃO deve aparecer como três colunas mecânicas repetitivas no produto final.

Princípio:

**ESTRUTURA RÍGIDA POR BAIXO. EXPERIÊNCIA VIVA POR CIMA.**

---

## 5. ÁTRIO E NAVEGAÇÃO

Home oficial: **O ÁTRIO**.

CTA primário: **ABRIR O PORTAL**.

Navegação global prevista:
- ciclo cronológico;
- Árvore da Vida;
- Quatro Mundos;
- trilhas de maestria;
- memória pessoal.

A tela `Hoje` continua sendo a tela funcional de menor carga cognitiva.

Progresso não usa barra percentual convencional como linguagem principal. Preferir:
- anel;
- geometria sagrada;
- nós da Árvore;
- Fragmentos da Coroa;
- `1/36`, `7/7`, `36/36`.

Loading usa geometria traçada/emanada, nunca spinner genérico quando o contexto permitir.

---

## 6. PROFUNDIDADE E MOTION

Planos de profundidade:
- Z0 atmosfera;
- Z1 arquitetura;
- Z2 conteúdo;
- Z3 artefatos/interação;
- Z4 HUD;
- Z5 feedback apenas quando necessário.

Motion deve:
- orientar;
- revelar;
- responder;
- transformar;
- recompensar;
- respirar.

Evitar animação contínua agressiva durante leitura, respiração, oração, Kavanah ou introspecção.

Kether emana; não desliza como interface convencional.

---

## 7. TIPOGRAFIA

Três vozes tipográficas funcionais:

1. **Sagrada / Display** — títulos, passagens, selos, revelações;
2. **Editorial / Body** — leitura longa do Codex;
3. **Sistema / Grotesk ou Mono** — HUD, métricas, dados, instrumentos.

As famílias tipográficas finais ainda exigem aprovação e tokenização. A função das três vozes está congelada.

---

## 8. DAY 001 — QUALITY BAR

O Dia 001 é o protótipo-mestre de qualidade e deve permanecer esparso e progressivo.

Sequência aprovada de intenção de experiência:

```text
vazio
→ primeira resposta ao toque
→ geometria
→ Dia 001 / Kether / A Coroa
→ O Salto Cósmico
→ travessia
→ Câmara de Kether
→ Revelação
→ Manuscrito
→ Relic Moment
→ Kavanah
→ intenção pessoal
→ contrato do Neófito
→ selo
→ Espelho da Alma
→ Quest
→ recompensa
→ Kether acende na Árvore
→ passagem
→ Átrio transformado
```

O Day 001 deve provar a linguagem do produto antes de escalar UI para 36 dias.

---

## 9. RELIC MOMENT

Todo Dia deve possuir um momento memorável de experiência — visual, interativo, espacial, sonoro ou material — capaz de tornar aquele Dia identificável sem depender apenas do texto.

O Relic Moment não pode introduzir doutrina nova nem símbolo não aprovado.

---

## 10. SAFETY, PRIVACY E EPISTEMOLOGIA

Obrigatório em todo Kether:
- HNK-EP-1.1;
- fenômeno subjetivo ≠ prova biomédica ou metafísica automática;
- safety stop preserva progresso válido já concluído;
- o produto não recompensa dor, desorientação, perda de controle ou fenômeno místico mais intenso;
- Diário sensível permanece cifrado antes do sync;
- analytics não recebe conteúdo em claro do Diário;
- reduced motion;
- contraste e escala tipográfica;
- controles claros de áudio, câmera e microfone.

---

## 11. O QUE NÃO ESTÁ CONGELADO AINDA

Estes itens NÃO podem ser inventados pela implementação:

### Referências canônicas pendentes
- resolução de XP copy nos Dias 002/003/005;
- fechamento incorreto de ciclo no Dia 011;
- referência canônica Dai Koo Myo;
- Gneo Geo / Estrela Goética Dupla / oito circuitos;
- reconciliação do Dia 035 “Pentagrama Primal”;
- definição do Sintonizador Angelical do Portal 036;
- Solfeggio de transição do Portal 036;
- sigilo canônico de Kether.

### Produção pendente
- presets de áudio aprovados;
- Acoustic Lab do Dia 019;
- AR espacial do Dia 025;
- par ASMR active/control do Dia 030;
- implementação real do Portal 036;
- P0 QA automatizado;
- assets finais publicados;
- famílias tipográficas finais;
- tokens cromáticos finais;
- full 3D Tree of Life.

---

## 12. GOVERNANÇA DO CÂNONE

O repositório canônico atualmente possui os 36 arquivos de Kether, mas o sistema de `review records` foi introduzido depois e ainda precisa ser retroaplicado ao Capítulo 1.

Antes de declarar **KETHER CANON FREEZE V1** como auditado sob a governança atual:

1. resolver os blockers editoriais abertos;
2. revalidar 705/705 dos 36 dias;
3. reconstruir o manuscrito;
4. criar/backfill review records dos Dias 001–036;
5. confirmar `state: canon` e aprovação canônica;
6. ressincronizar Kether para Supabase a partir do novo commit SHA;
7. atualizar dependências de experiência e assets somente depois do commit canônico.

---

## 13. DEFINITION OF DONE — KETHER RELEASE V1

Kether só é produto fechado quando:

- 36/36 dias canônicos válidos;
- blockers editoriais executáveis resolvidos;
- review records 001–036 completos;
- Supabase sincronizado com commit canônico atual;
- Day Shell implementado;
- Day 001 vertical slice implementado e aprovado;
- ciclos 001–035 implementados;
- Practice Records, XP e idempotência implementados;
- Coroa 7/7 implementada;
- Portal 036 implementado;
- Diário/Vault testado;
- assets necessários approved/published;
- áudio necessário versionado;
- QA P0 verde;
- mobile e web testados;
- acessibilidade e offline testados;
- CI/CD verde;
- execução ponta a ponta do onboarding até `KETHER COMPLETE / LEVEL 2 — INICIADO / CHOKMAH UNLOCKED`.

---

## 14. REGRA DE AVANÇO

Até o Kether Release V1:

- Chokmah pode permanecer canônico no repositório editorial;
- Chokmah não deve redefinir o design system, domínio ou arquitetura de produto;
- nenhuma produção em escala do Capítulo 2 deve desviar recursos do fechamento do vertical slice de Kether.

**Kether é agora a referência de qualidade, arquitetura e linguagem visual para a expansão do HNK Codex Digital.**
