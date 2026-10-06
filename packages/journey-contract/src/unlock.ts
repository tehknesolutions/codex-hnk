import {advanceJourneyProgress} from './progress.js';
import {getJourneyNavigation,resolveJourneyTarget} from './navigation.js';

export type AuthoritativeCompletionReceipt=Readonly<{dayId:string;accepted:boolean;completionId:string;events:readonly string[];serverCompletedAt?:string}>;

export function applyAuthoritativeCompletion(receipt:AuthoritativeCompletionReceipt){
 const current=resolveJourneyTarget(receipt.dayId);
 if(current.status!=='AVAILABLE')throw new Error(`Authoritative completion requires AVAILABLE Day: ${receipt.dayId}`);
 if(!receipt.accepted||!receipt.completionId.trim())throw new Error('Server-authoritative accepted completion receipt required');
 const progress=advanceJourneyProgress(undefined,current.dayId,'COMPLETED',receipt.serverCompletedAt);
 const numericNext=String(Number(current.dayId)+1).padStart(3,'0');
 const nextTarget=resolveJourneyTarget(numericNext);
 const navigation=getJourneyNavigation(current.dayId);
 // Completion may report progression intent, but publication authority remains the Journey Registry.
 // Therefore NEXT_DAY_UNLOCKED cannot manufacture an executable href for a DORMANT slot.
 return Object.freeze({progress,events:Object.freeze([...receipt.events]),nextTarget,navigation});
}
