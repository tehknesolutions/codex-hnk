import type {QuestDefinition,QuestDefinitionLoader} from '@hnk/quest-engine';
import day036QuestJson from '../../../docs/experience/kether/day-036/day-036.quest.json';
import day036CanonJson from '../../../docs/experience/kether/day-036/day-036.canon-blocks.json';
import day036PackJson from '../../../docs/experience/kether/day-036/day-036.quest-pack.json';
import day037QuestJson from '../../../docs/experience/chokmah/day-037/day-037.quest.json';
import day037CanonJson from '../../../docs/experience/chokmah/day-037/day-037.canon-blocks.json';
import day037PackJson from '../../../docs/experience/chokmah/day-037/day-037.quest-pack.json';
import day038QuestJson from '../../../docs/experience/chokmah/day-038/day-038.quest.json';
import day038CanonJson from '../../../docs/experience/chokmah/day-038/day-038.canon-blocks.json';
import day038PackJson from '../../../docs/experience/chokmah/day-038/day-038.quest-pack.json';
import day039QuestJson from '../../../docs/experience/chokmah/day-039/day-039.quest.json';
import day039CanonJson from '../../../docs/experience/chokmah/day-039/day-039.canon-blocks.json';
import day039PackJson from '../../../docs/experience/chokmah/day-039/day-039.quest-pack.json';
import day040QuestJson from '../../../docs/experience/chokmah/day-040/day-040.quest.json';
import day040CanonJson from '../../../docs/experience/chokmah/day-040/day-040.canon-blocks.json';
import day040PackJson from '../../../docs/experience/chokmah/day-040/day-040.quest-pack.json';
import day041QuestJson from '../../../docs/experience/chokmah/day-041/day-041.quest.json';
import day041CanonJson from '../../../docs/experience/chokmah/day-041/day-041.canon-blocks.json';
import day041PackJson from '../../../docs/experience/chokmah/day-041/day-041.quest-pack.json';
import {BundledQuestLibrary as Day001To035Library} from './library.js';
import type {RuntimeCanonManifest,RuntimeQuestBundle,RuntimeQuestBundleLoader} from './types.js';
function bundle(day:36|37|38|39|40|41):RuntimeQuestBundle{if(day===36)return{day,quest:day036QuestJson as unknown as QuestDefinition,canon:day036CanonJson as unknown as RuntimeCanonManifest,pack:day036PackJson as unknown as Record<string,unknown>};if(day===37)return{day,quest:day037QuestJson as unknown as QuestDefinition,canon:day037CanonJson as unknown as RuntimeCanonManifest,pack:day037PackJson as unknown as Record<string,unknown>};if(day===38)return{day,quest:day038QuestJson as unknown as QuestDefinition,canon:day038CanonJson as unknown as RuntimeCanonManifest,pack:day038PackJson as unknown as Record<string,unknown>};if(day===39)return{day,quest:day039QuestJson as unknown as QuestDefinition,canon:day039CanonJson as unknown as RuntimeCanonManifest,pack:day039PackJson as unknown as Record<string,unknown>};if(day===40)return{day,quest:day040QuestJson as unknown as QuestDefinition,canon:day040CanonJson as unknown as RuntimeCanonManifest,pack:day040PackJson as unknown as Record<string,unknown>};return{day,quest:day041QuestJson as unknown as QuestDefinition,canon:day041CanonJson as unknown as RuntimeCanonManifest,pack:day041PackJson as unknown as Record<string,unknown>}}
function validate(value:RuntimeQuestBundle){if(value.quest.day!==value.day||value.canon.source.day!==value.day)throw new Error(`quest_library_day_mismatch:${value.day}`);if(value.quest.canonical.source_sha!==value.canon.source.blob_sha)throw new Error(`quest_library_source_sha_mismatch:${value.day}`);return value}
export class PortalAwareQuestLibrary implements RuntimeQuestBundleLoader,QuestDefinitionLoader{private readonly base=new Day001To035Library();async loadBundle(day:number):Promise<RuntimeQuestBundle|null>{if(day===36||day===37||day===38||day===39||day===40||day===41)return validate(bundle(day));return this.base.loadBundle(day)}async loadDay(day:number):Promise<QuestDefinition|null>{return(await this.loadBundle(day))?.quest??null}listAvailableDays():number[]{return[...new Set([...this.base.listAvailableDays(),36,37,38,39,40,41])].sort((a,b)=>a-b)}}
export function createBundledQuestLibrary():PortalAwareQuestLibrary{return new PortalAwareQuestLibrary()}
