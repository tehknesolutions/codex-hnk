import { resolveDay001PremiumJourney } from './day001-premium-contract.mjs';

const REQUIRED_CANON_SECTIONS = ['revelation', 'doctrine', 'kavanah'];

export function buildDay001PremiumViewModel({ canon, authoritativeComplete, unlockedThrough, vault = { reflection: '', status: 'idle' } }) {
  const missing = REQUIRED_CANON_SECTIONS.filter((section) => !canon?.sections?.[section] || String(canon.sections[section]).trim().length === 0);
  return {
    canon,
    contentStatus: missing.length === 0 ? 'ready' : 'unavailable',
    contentUnavailableReason: missing.length === 0 ? null : `Missing required canonical section(s): ${missing.join(', ')}`,
    journey: resolveDay001PremiumJourney({ unlockedThrough, authoritativeComplete }),
    vault: { reflection: vault.reflection ?? '', status: vault.status ?? 'idle', authorship: 'user' },
    seal: { status: authoritativeComplete === true ? 'complete' : 'locked' },
  };
}
