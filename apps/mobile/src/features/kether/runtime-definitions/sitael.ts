import {
  SITAEL_DAY_011 as DAY_011,
  SITAEL_DAY_012 as DAY_012,
  SITAEL_DAY_013 as DAY_013,
  SITAEL_DAY_014 as DAY_014,
  SITAEL_DAY_015 as DAY_015_LEGACY,
} from '../day-definitions';

export const SITAEL_DAY_011 = DAY_011;
export const SITAEL_DAY_012 = DAY_012;
export const SITAEL_DAY_013 = DAY_013;
export const SITAEL_DAY_014 = DAY_014;

export const SITAEL_DAY_015 = {
  ...DAY_015_LEGACY,
  evidence: {
    ...DAY_015_LEGACY.evidence,
    requiredTrue: [
      'protocol_completed',
      'return_confirmed',
      'closure_completed',
      'action_commitment_created',
    ],
  },
} as const;
