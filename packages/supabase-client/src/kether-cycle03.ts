import type { Json } from '@hnk/database';

export type SitaelDay = 11 | 12 | 13 | 14 | 15;

export interface SitaelFragmentState {
  fragment: 3;
  angel: 'Sitael';
  completedDays: number;
  lit: boolean;
}

export interface SitaelRouteState {
  activeDay: SitaelDay | null;
  cycleComplete: boolean;
  nextCycleDay: number | null;
}

export function resolveSitaelRoute(currentDay:number|null|undefined):SitaelRouteState{
 const safeDay=Number.isInteger(currentDay)?Number(currentDay):11;
 if(safeDay<=11)return{activeDay:11,cycleComplete:false,nextCycleDay:null};
 if(safeDay>=12&&safeDay<=15)return{activeDay:safeDay as SitaelDay,cycleComplete:false,nextCycleDay:null};
 return{activeDay:null,cycleComplete:true,nextCycleDay:16};
}

export function parseSitaelFragment(crown:Json):SitaelFragmentState{
 if(typeof crown!=='object'||crown===null||Array.isArray(crown))throw new Error('invalid_kether_crown_state');
 const cycles=(crown as Record<string,Json|undefined>).cycles;if(!Array.isArray(cycles))throw new Error('invalid_kether_crown_state');
 for(const cycle of cycles){
  if(typeof cycle!=='object'||cycle===null||Array.isArray(cycle))continue;
  const row=cycle as Record<string,Json|undefined>;
  if(row.fragment!==3||row.angel!=='Sitael')continue;
  if(typeof row.completed_days!=='number'||typeof row.lit!=='boolean')throw new Error('invalid_sitael_fragment_state');
  return{fragment:3,angel:'Sitael',completedDays:row.completed_days,lit:row.lit};
 }
 throw new Error('sitael_fragment_missing');
}

export function assertSitaelProgress(crown:Json,expectedCompletedDays:number):SitaelFragmentState{
 if(!Number.isInteger(expectedCompletedDays)||expectedCompletedDays<0||expectedCompletedDays>5)throw new Error('invalid_sitael_expected_progress');
 const fragment=parseSitaelFragment(crown);
 const expectedLit=expectedCompletedDays===5;
 if(fragment.completedDays!==expectedCompletedDays||fragment.lit!==expectedLit)throw new Error('sitael_fragment_progress_mismatch');
 return fragment;
}
