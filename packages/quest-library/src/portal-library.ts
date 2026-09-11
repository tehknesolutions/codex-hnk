import type {QuestDefinition,QuestDefinitionLoader} from '@hnk/quest-engine';
import day036QuestJson from '../../../docs/experience/kether/day-036/day-036.quest.json';
import day036CanonJson from '../../../docs/experience/kether/day-036/day-036.canon-blocks.json';
import day036PackJson from '../../../docs/experience/kether/day-036/day-036.quest-pack.json';
import {BundledQuestLibrary as Day001To035Library} from './library.js';
import type {RuntimeCanonManifest,RuntimeQuestBundle,RuntimeQuestBundleLoader} from './types.js';
function day036Bundle():RuntimeQuestBundle{return{day:36,quest:day036QuestJson as unknown as QuestDefinition,canon:day036CanonJson as unknown as RuntimeCanonManifest,pack:day036PackJson as unknown as Record<string,unknown>}}
function validate(bundle:RuntimeQuestBundle){if(bundle.quest.day!==36||bundle.canon.source.day!==36)throw new Error('quest_library_day036_mismatch');if(bundle.quest.canonical.source_sha!==bundle.canon.source.blob_sha)throw new Error('quest_library_day036_source_sha_mismatch');return bundle}
export class PortalAwareQuestLibrary implements RuntimeQuestBundleLoader,QuestDefinitionLoader{private readonly base=new Day001To035Library();async loadBundle(day:number):Promise<RuntimeQuestBundle|null>{if(day===36)return validate(day036Bundle());return this.base.loadBundle(day)}async loadDay(day:number):Promise<QuestDefinition|null>{return(await this.loadBundle(day))?.quest??null}listAvailableDays():number[]{return[...new Set([...this.base.listAvailableDays(),36])].sort((a,b)=>a-b)}}
export function createBundledQuestLibrary():PortalAwareQuestLibrary{return new PortalAwareQuestLibrary()}
