import {describe,expect,it} from 'vitest';
import {applyAuthoritativeCompletion} from './unlock.js';

describe('M6 authoritative completion bridge',()=>{
 it('accepts server-confirmed completion for an AVAILABLE Day',()=>{
  const result=applyAuthoritativeCompletion({dayId:'072',accepted:true,completionId:'c-072',events:['NEXT_DAY_UNLOCKED']});
  expect(result.progress.state).toBe('COMPLETED');
  expect(result.progress.dayId).toBe('072');
 });
 it('does not promote a dormant next Day merely because completion emitted NEXT_DAY_UNLOCKED',()=>{
  const result=applyAuthoritativeCompletion({dayId:'072',accepted:true,completionId:'c-072',events:['NEXT_DAY_UNLOCKED']});
  expect(result.nextTarget).toEqual({dayId:'073',status:'DORMANT'});
 });
 it('rejects client-only or server-rejected completion',()=>{
  expect(()=>applyAuthoritativeCompletion({dayId:'072',accepted:false,completionId:'c-072',events:[]})).toThrow(/server|authoritative|accepted/i);
 });
 it('rejects completion claims for dormant Days',()=>{
  expect(()=>applyAuthoritativeCompletion({dayId:'073',accepted:true,completionId:'c-073',events:[]})).toThrow(/available/i);
 });
});
