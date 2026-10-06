import { getJourneyDay, getJourneyNavigation, getJourneySlots, projectDayChamber, resolveJourneyTarget, type ChamberEvidenceMap } from '../../../../../packages/journey-contract/src/index';

export function getMobileJourneySlots(){return getJourneySlots();}
export function resolveMobileJourneyTarget(dayId:string){return resolveJourneyTarget(dayId);}
export function getMobileDayChamber(dayId:string,evidence:ChamberEvidenceMap={}){
 const descriptor=getJourneyDay(dayId);
 if(!descriptor||descriptor.status!=='AVAILABLE')throw new Error(`Mobile Day ${dayId} is not executable`);
 return {descriptor,chamber:projectDayChamber(descriptor,evidence),navigation:getJourneyNavigation(dayId)};
}
