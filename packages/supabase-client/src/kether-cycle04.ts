import type { Json } from '@hnk/database';

export type ElemiahDay=16|17|18|19|20;
export interface ElemiahFragmentState{fragment:4;angel:'Elemiah';completedDays:number;lit:boolean}
export interface ElemiahRouteState{activeDay:ElemiahDay|null;cycleComplete:boolean;nextCycleDay:number|null}

export function resolveElemiahRoute(currentDay:number|null|undefined):ElemiahRouteState{
 const safeDay=Number.isInteger(currentDay)?Number(currentDay):16;
 if(safeDay<=16)return{activeDay:16,cycleComplete:false,nextCycleDay:null};
 if(safeDay>=17&&safeDay<=20)return{activeDay:safeDay as ElemiahDay,cycleComplete:false,nextCycleDay:null};
 return{activeDay:null,cycleComplete:true,nextCycleDay:21};
}

export function parseElemiahFragment(crown:Json):ElemiahFragmentState{
 if(typeof crown!=='object'||crown===null||Array.isArray(crown))throw new Error('invalid_kether_crown_state');
 const cycles=(crown as Record<string,Json|undefined>).cycles;if(!Array.isArray(cycles))throw new Error('invalid_kether_crown_state');
 for(const cycle of cycles){if(typeof cycle!=='object'||cycle===null||Array.isArray(cycle))continue;const row=cycle as Record<string,Json|undefined>;if(row.fragment!==4||row.angel!=='Elemiah')continue;if(typeof row.completed_days!=='number'||typeof row.lit!=='boolean')throw new Error('invalid_elemiah_fragment_state');return{fragment:4,angel:'Elemiah',completedDays:row.completed_days,lit:row.lit}}
 throw new Error('elemiah_fragment_missing');
}

export function assertElemiahProgress(crown:Json,expectedCompletedDays:number):ElemiahFragmentState{
 if(!Number.isInteger(expectedCompletedDays)||expectedCompletedDays<0||expectedCompletedDays>5)throw new Error('invalid_elemiah_expected_progress');
 const fragment=parseElemiahFragment(crown);const expectedLit=expectedCompletedDays===5;
 if(fragment.completedDays!==expectedCompletedDays||fragment.lit!==expectedLit)throw new Error('elemiah_fragment_progress_mismatch');
 return fragment;
}
