export type PointRating = { focus:number|null; comfort:number|null; silence:number|null; presence:number|null; readiness:number|null };
export type RatingKey = keyof PointRating;
export const emptyRatings=():PointRating[]=>Array.from({length:4},()=>({focus:null,comfort:null,silence:null,presence:null,readiness:null}));
export const ratingsComplete=(r:PointRating[])=>r.every(p=>Object.values(p).every(v=>typeof v==='number'));
export const ratingAverage=(r:PointRating[],k:RatingKey)=>{const v=r.map(p=>p[k]).filter((x):x is number=>typeof x==='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:0};
export const ordinal=<T extends string>(v:T,items:readonly T[])=>Math.max(0,items.indexOf(v));
export const DAY025_ORDINALS={
 lighting:['dim','normal','bright'],noise:['quiet','moderate','noisy'],temperature:['unknown','cool','neutral','warm'],organization:['clear','mixed','cluttered'],ventilation:['closed','normal','open'],people:['alone','others'],comparison:['active_higher','control_higher','mixed','no_clear_difference'],constant:['lighting','noise','time','path','other']
} as const;
