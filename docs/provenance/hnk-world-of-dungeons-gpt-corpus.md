# HNK: World of Dungeons — GPT Corpus Provenance

Status: PROJECT PROVENANCE / DOCUMENTARY PROJECTION
Date: 2026-09-28
Issue: #364

## Authority note
This document preserves a project corpus produced through the HNK: World of Dungeons GPT project. It does not automatically elevate every historical idea to HNK canon. CODEX-HNK remains the authority for HNK principles; lifecycle labels below distinguish approved current direction from prototypes, deprecated technology and planned work.

## Product
HNK: World of Dungeons is an action RPG centered on dungeons, exploration, combat, gathering, guild contracts and spiritual progression. The current project direction uses browser/HTML5 with Phaser 3 + TypeScript + Vite and an ISO2D/isometric dark-fantasy visual direction.

## Core loop
Auralis → preparation → contract → Rift Gate → dungeon → combat/exploration/puzzle/gathering → objective → return/extraction → reward → progression → Animic Memory → next expedition.

Approved initial slice: contract/NPC → Rank D mission → Primeira Fenda → Rastejante de Pedra → Faísca Ardente → Salamandra Anímica/Faísca Gêmea → Fragmento de Rocha Espiritual → return → reward → Animic Memory → save.

## World and progression concepts
Auralis is the initial hub: city, tutorial, economy, preparation, narrative and Rift access. Recorded spaces include arrival/central plazas, Rift gate, skill/Guardian workshops, stores, Guild, Constellation sanctuary, archive, infirmary, mentors, market, crafting, lodging and Rift Guard administration.

Character identity is intended to emerge from skills, mentors/schools, element, weapon, stance, Guardian/bond, Constellations, Animic Orders, evolution, titles, reputation and lived events rather than a fixed class choice.

Astral Guardians are systemic companions spanning combat, exploration, gathering, puzzles and narrative. Recorded evolution: Centelha → Manifesto → Ascendente → Celestial → Ancestral → Astral Supremo. Initial Guardian: Salamandra Anímica; Guardian skill: Faísca Gêmea.

Constellations observe behavior and can test/sponsor progression. Animic Orders are a distinct identity/will layer. Animic Memory turns meaningful events into persistent history/consequences; recorded scale: Rotineiro → Local → Marcante → Histórico → Lendário.

## Primeira Fenda
Recorded sequence: Entrada Rachada; Galeria dos Selos; Corredor das Pedras Vivas; Câmara das Raízes Corrompidas; planned Viveiro dos Ecos. The first room anchors the vertical slice; later rooms introduce puzzle/escort/corruption, reactive terrain and organic corruption/purification.

## Technology history
The project began with a BYOND/DM implementation containing player state, combat, initial skill/Guardian/mission/enemy/item and Animic Memory structures. Recorded friction included missing placeholder assets, raw BYOND presentation/HUD limitations and client/HUD integration errors. BYOND is preserved as DEPRECATED current-target technology and valuable archaeology.

The implementation direction then moved to HTML5/Phaser to prove gameplay before MMO complexity. Recorded scenes include Boot, Title, Character Select/Creation, Arrival Gate, biome playground and Game scenes. Multiplayer/backend/global economy/PvP/authentication were moved outside the first vertical slice.

## ISO2D and architecture
ISO2D/isometric 2D is the approved visual/world direction. The first targeted reconstruction is Auralis — Portão de Chegada.

Approved R1 architecture boundaries: `core`, `game`, `scenes`, `entities`, `systems`, `world`, `content`, `data`, `ui`, `assets`. Dependency intent: Scene → Systems → Domain/Data. Scenes should orchestrate Phaser lifecycle; durable combat/quest/inventory/Guardian/memory/save rules belong in systems. World/ISO2D runtime should not depend on Auralis-specific quest content.

## Asset provenance
The GPT project contains base-human animation sheets (idle/walk/run/roll/fighting/idle variation), terrain tiles (grass/water/mud/clay/snow/stone/crystals/mixed), biome and vegetation references, and Auralis RPG mockups. This document records their existence; binary assets are not duplicated here by this documentation PR.

## Lifecycle snapshot
APPROVED/CANON project baseline in this corpus: product identity, browser MVP, Phaser/TypeScript/Vite direction, ISO2D direction, Auralis, Primeira Fenda, Rank D vertical slice, Rastejante de Pedra, Faísca Ardente, Salamandra Anímica, Faísca Gêmea, Fragmento de Rocha Espiritual, Guardians and Animic Memory.

PROTOTYPE: Jardim das Fronteiras and earlier technical playgrounds.

DEPRECATED as current target: BYOND runtime and old flat top-down visual direction.

PLANNED: expanded Constellations/Orders/crafting/economy and multiplayer/MMO infrastructure after the single-player vertical-slice proof.

## Relationship to TEHKNE-OS
The corresponding TEHKNE-OS ingestion is the institutional memory projection and should retain fuller lifecycle/provenance. CODEX-HNK keeps this HNK-facing documentary projection so the project history is discoverable without confusing project archaeology with canonical authority.

## Source limitation
The synthesis is based on the recoverable files/chats/assets present in the GPT project and explicitly approved decisions in that conversation. Missing details are not silently reconstructed from outside knowledge.