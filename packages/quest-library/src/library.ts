import type { QuestDefinition, QuestDefinitionLoader } from '@hnk/quest-engine';
import day001QuestJson from '../../../docs/experience/kether/day-001/day-001.quest.json';
import day001CanonJson from '../../../docs/experience/kether/day-001/day-001.canon-blocks.json';
import day001PackJson from '../../../docs/experience/kether/day-001/day-001.quest-pack.json';
import day002QuestJson from '../../../docs/experience/kether/day-002/day-002.quest.json';
import day002CanonJson from '../../../docs/experience/kether/day-002/day-002.canon-blocks.json';
import day002PackJson from '../../../docs/experience/kether/day-002/day-002.quest-pack.json';
import day003QuestJson from '../../../docs/experience/kether/day-003/day-003.quest.json';
import day003CanonJson from '../../../docs/experience/kether/day-003/day-003.canon-blocks.json';
import day003PackJson from '../../../docs/experience/kether/day-003/day-003.quest-pack.json';
import day004QuestJson from '../../../docs/experience/kether/day-004/day-004.quest.json';
import day004CanonJson from '../../../docs/experience/kether/day-004/day-004.canon-blocks.json';
import day004PackJson from '../../../docs/experience/kether/day-004/day-004.quest-pack.json';
import day005QuestJson from '../../../docs/experience/kether/day-005/day-005.quest.json';
import day005CanonJson from '../../../docs/experience/kether/day-005/day-005.canon-blocks.json';
import day005PackJson from '../../../docs/experience/kether/day-005/day-005.quest-pack.json';
import day006QuestJson from '../../../docs/experience/kether/day-006/day-006.quest.json';
import day006CanonJson from '../../../docs/experience/kether/day-006/day-006.canon-blocks.json';
import day006PackJson from '../../../docs/experience/kether/day-006/day-006.quest-pack.json';
import day007QuestJson from '../../../docs/experience/kether/day-007/day-007.quest.json';
import day007CanonJson from '../../../docs/experience/kether/day-007/day-007.canon-blocks.json';
import day007PackJson from '../../../docs/experience/kether/day-007/day-007.quest-pack.json';
import day008QuestJson from '../../../docs/experience/kether/day-008/day-008.quest.json';
import day008CanonJson from '../../../docs/experience/kether/day-008/day-008.canon-blocks.json';
import day008PackJson from '../../../docs/experience/kether/day-008/day-008.quest-pack.json';
import day009QuestJson from '../../../docs/experience/kether/day-009/day-009.quest.json';
import day009CanonJson from '../../../docs/experience/kether/day-009/day-009.canon-blocks.json';
import day009PackJson from '../../../docs/experience/kether/day-009/day-009.quest-pack.json';
import type { RuntimeCanonManifest, RuntimeQuestBundle, RuntimeQuestBundleLoader } from './types.js';
function asQuest(value: unknown): QuestDefinition { return value as QuestDefinition; }
function asCanon(value: unknown): RuntimeCanonManifest { return value as RuntimeCanonManifest; }
function asPack(value: unknown): Record<string, unknown> { return value as Record<string, unknown>; }
const BUNDLES = new Map<number, RuntimeQuestBundle>([
  [1,{day:1,quest:asQuest(day001QuestJson),canon:asCanon(day001CanonJson),pack:asPack(day001PackJson)}],
  [2,{day:2,quest:asQuest(day002QuestJson),canon:asCanon(day002CanonJson),pack:asPack(day002PackJson)}],
  [3,{day:3,quest:asQuest(day003QuestJson),canon:asCanon(day003CanonJson),pack:asPack(day003PackJson)}],
  [4,{day:4,quest:asQuest(day004QuestJson),canon:asCanon(day004CanonJson),pack:asPack(day004PackJson)}],
  [5,{day:5,quest:asQuest(day005QuestJson),canon:asCanon(day005CanonJson),pack:asPack(day005PackJson)}],
  [6,{day:6,quest:asQuest(day006QuestJson),canon:asCanon(day006CanonJson),pack:asPack(day006PackJson)}],
  [7,{day:7,quest:asQuest(day007QuestJson),canon:asCanon(day007CanonJson),pack:asPack(day007PackJson)}],
  [8,{day:8,quest:asQuest(day008QuestJson),canon:asCanon(day008CanonJson),pack:asPack(day008PackJson)}],
  [9,{day:9,quest:asQuest(day009QuestJson),canon:asCanon(day009CanonJson),pack:asPack(day009PackJson)}],
]);
function validateBundle(bundle:RuntimeQuestBundle):RuntimeQuestBundle{if(bundle.quest.day!==bundle.day)throw new Error(`quest_library_day_mismatch:${bundle.day}`);if(bundle.canon.source.day!==bundle.day)throw new Error(`quest_library_canon_day_mismatch:${bundle.day}`);if(bundle.quest.canonical.source_sha!==bundle.canon.source.blob_sha)throw new Error(`quest_library_source_sha_mismatch:${bundle.day}`);return bundle}
export class BundledQuestLibrary implements RuntimeQuestBundleLoader,QuestDefinitionLoader{async loadBundle(day:number):Promise<RuntimeQuestBundle|null>{const bundle=BUNDLES.get(day);return bundle?validateBundle(bundle):null}async loadDay(day:number):Promise<QuestDefinition|null>{return(await this.loadBundle(day))?.quest??null}listAvailableDays():number[]{return[...BUNDLES.keys()].sort((a,b)=>a-b)}}
export function createBundledQuestLibrary():BundledQuestLibrary{return new BundledQuestLibrary()}
