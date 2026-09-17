// @ts-nocheck
import {
  HNK_EXPERIMENT_PROTOCOL_ID,
  HNK_EXPERIMENT_PROTOCOL_VERSION,
  validateExperimentProtocol,
} from "@hnk/experiment-protocol";

export const HNK_EXPERIMENT_ATTESTATION_ID = "HNK_EXPERIMENT_ATTESTATION_V1";
export const HNK_EXPERIMENT_ATTESTATION_VERSION = "1.0.0";
export const HNK_EXPERIMENT_ATTESTATION_ALGORITHM = "SHA-256";
export const HNK_EXPERIMENT_ATTESTATION_SCOPE = "CONTENT_INTEGRITY_ONLY";
export const HNK_EXPERIMENT_ATTESTATION_BOUNDARY = "ATTESTATION_BINDS_CONTENT_NOT_AUTHORSHIP_TIME_CAUSALITY_OR_METAPHYSICAL_PROOF";

const HEX_64 = /^[0-9a-f]{64}$/;
const K = Object.freeze([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function nonEmpty(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function rotr(value, bits) {
  return (value >>> bits) | (value << (32 - bits));
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON does not support non-finite numbers");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    const output = {};
    for (const key of Object.keys(value).sort()) {
      const child = value[key];
      if (child === undefined) throw new TypeError(`canonical JSON does not support undefined at ${key}`);
      output[key] = canonicalize(child);
    }
    return output;
  }
  throw new TypeError(`canonical JSON does not support ${typeof value}`);
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Hex(text) {
  if (typeof text !== "string") throw new TypeError("sha256Hex input must be a string");
  const bytes = Array.from(new TextEncoder().encode(text));
  const bitLength = BigInt(bytes.length) * 8n;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let shift = 56n; shift >= 0n; shift -= 8n) bytes.push(Number((bitLength >> shift) & 0xffn));

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i += 1) {
      const j = offset + i * 4;
      w[i] = (((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + s1 + ch + K[i] + w[i]) >>> 0;
      const s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0,h1,h2,h3,h4,h5,h6,h7].map((value) => value.toString(16).padStart(8, "0")).join("");
}

export function sha256Canonical(value) {
  return sha256Hex(canonicalJson(value));
}

export function experimentPreregistrationProjection(protocol) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot project invalid experiment protocol: ${validation.issues.join("; ")}`);
  return deepFreeze(canonicalize({
    protocol_id: protocol.protocol_id,
    protocol_version: protocol.protocol_version,
    authority: protocol.authority,
    experiment_id: protocol.experiment_id,
    created_at: protocol.created_at,
    locked_at: protocol.locked_at,
    preregistration_locked: protocol.preregistration_locked,
    title: protocol.title,
    question: protocol.question,
    hypothesis: protocol.hypothesis,
    plan: protocol.plan,
    claim_boundary: protocol.claim_boundary,
  }));
}

function sessionChainEntry(entry, ordinal, previousDigest) {
  const artifactDigest = sha256Canonical(entry.artifact);
  const payload = {
    kind: "SESSION",
    ordinal,
    assignment_id: entry.assignment_id,
    role: entry.role,
    added_at: entry.added_at,
    session_id: entry.artifact.initial.session_id,
    artifact_digest: artifactDigest,
    previous_digest: previousDigest,
  };
  return deepFreeze({ ...payload, chain_digest: sha256Canonical(payload) });
}

function reportChainEntry(report, previousDigest) {
  const reportDigest = sha256Canonical(report);
  const payload = {
    kind: "REPORT",
    completed_at: report.completed_at,
    report_digest: reportDigest,
    previous_digest: previousDigest,
  };
  return deepFreeze({ ...payload, chain_digest: sha256Canonical(payload) });
}

function validateSelf(attestation) {
  const issues = [];
  if (!attestation || typeof attestation !== "object") return ["attestation must be an object"];
  if (attestation.attestation_id !== HNK_EXPERIMENT_ATTESTATION_ID) issues.push(`unexpected attestation_id ${attestation.attestation_id}`);
  if (attestation.attestation_version !== HNK_EXPERIMENT_ATTESTATION_VERSION) issues.push(`unexpected attestation_version ${attestation.attestation_version}`);
  if (attestation.algorithm !== HNK_EXPERIMENT_ATTESTATION_ALGORITHM) issues.push(`unexpected algorithm ${attestation.algorithm}`);
  if (attestation.scope !== HNK_EXPERIMENT_ATTESTATION_SCOPE) issues.push(`unexpected scope ${attestation.scope}`);
  if (attestation.protocol_id !== HNK_EXPERIMENT_PROTOCOL_ID) issues.push(`unexpected protocol_id ${attestation.protocol_id}`);
  if (attestation.protocol_version !== HNK_EXPERIMENT_PROTOCOL_VERSION) issues.push(`unexpected protocol_version ${attestation.protocol_version}`);
  if (!nonEmpty(attestation.generated_at)) issues.push("generated_at required");
  if (!nonEmpty(attestation.experiment_id)) issues.push("experiment_id required");
  if (!HEX_64.test(attestation.preregistration_digest ?? "")) issues.push("preregistration_digest must be lowercase SHA-256 hex");
  if (!HEX_64.test(attestation.protocol_snapshot_digest ?? "")) issues.push("protocol_snapshot_digest must be lowercase SHA-256 hex");
  if (attestation.timestamp_authority !== "NONE") issues.push("timestamp_authority must remain NONE");
  if (attestation.identity_signature !== "NONE") issues.push("identity_signature must remain NONE");
  if (attestation.authorship_proof !== false) issues.push("authorship_proof must remain false");
  if (attestation.trusted_timestamp_proof !== false) issues.push("trusted_timestamp_proof must remain false");
  if (attestation.causal_proof !== false) issues.push("causal_proof must remain false");
  if (attestation.metaphysical_proof !== false) issues.push("metaphysical_proof must remain false");
  if (attestation.claim_boundary !== HNK_EXPERIMENT_ATTESTATION_BOUNDARY) issues.push(`unexpected claim_boundary ${attestation.claim_boundary}`);
  if (!Array.isArray(attestation.sessions)) issues.push("sessions must be an array");

  let previous = attestation.preregistration_digest;
  if (Array.isArray(attestation.sessions)) {
    for (let index = 0; index < attestation.sessions.length; index += 1) {
      const entry = attestation.sessions[index];
      if (entry.ordinal !== index + 1) issues.push(`session ordinal mismatch at ${index + 1}`);
      if (!nonEmpty(entry.assignment_id)) issues.push(`session ${index + 1} assignment_id required`);
      if (!nonEmpty(entry.role)) issues.push(`session ${index + 1} role required`);
      if (!nonEmpty(entry.added_at)) issues.push(`session ${index + 1} added_at required`);
      if (!nonEmpty(entry.session_id)) issues.push(`session ${index + 1} session_id required`);
      if (!HEX_64.test(entry.artifact_digest ?? "")) issues.push(`session ${index + 1} artifact_digest invalid`);
      if (entry.previous_digest !== previous) issues.push(`session ${index + 1} previous_digest mismatch`);
      const payload = {
        kind: "SESSION",
        ordinal: entry.ordinal,
        assignment_id: entry.assignment_id,
        role: entry.role,
        added_at: entry.added_at,
        session_id: entry.session_id,
        artifact_digest: entry.artifact_digest,
        previous_digest: entry.previous_digest,
      };
      const expected = sha256Canonical(payload);
      if (entry.chain_digest !== expected) issues.push(`session ${index + 1} chain_digest mismatch`);
      previous = entry.chain_digest;
    }
  }

  if (attestation.report !== null && attestation.report !== undefined) {
    const entry = attestation.report;
    if (!nonEmpty(entry.completed_at)) issues.push("report completed_at required");
    if (!HEX_64.test(entry.report_digest ?? "")) issues.push("report_digest invalid");
    if (entry.previous_digest !== previous) issues.push("report previous_digest mismatch");
    const payload = {
      kind: "REPORT",
      completed_at: entry.completed_at,
      report_digest: entry.report_digest,
      previous_digest: entry.previous_digest,
    };
    const expected = sha256Canonical(payload);
    if (entry.chain_digest !== expected) issues.push("report chain_digest mismatch");
    previous = entry.chain_digest;
  }

  if (attestation.chain_head !== previous) issues.push("chain_head mismatch");
  return issues;
}

export function createExperimentAttestation(protocol, input = {}) {
  const validation = validateExperimentProtocol(protocol);
  if (!validation.ok) throw new Error(`cannot attest invalid experiment protocol: ${validation.issues.join("; ")}`);
  const generatedAt = input.generated_at ?? new Date().toISOString();
  if (!nonEmpty(generatedAt)) throw new TypeError("generated_at must be a non-empty string");

  const preregistrationDigest = sha256Canonical(experimentPreregistrationProjection(protocol));
  let previous = preregistrationDigest;
  const sessions = protocol.sessions.map((entry, index) => {
    const chained = sessionChainEntry(entry, index + 1, previous);
    previous = chained.chain_digest;
    return chained;
  });
  const report = protocol.report ? reportChainEntry(protocol.report, previous) : null;
  if (report) previous = report.chain_digest;

  const attestation = deepFreeze({
    attestation_id: HNK_EXPERIMENT_ATTESTATION_ID,
    attestation_version: HNK_EXPERIMENT_ATTESTATION_VERSION,
    algorithm: HNK_EXPERIMENT_ATTESTATION_ALGORITHM,
    scope: HNK_EXPERIMENT_ATTESTATION_SCOPE,
    generated_at: generatedAt.trim(),
    experiment_id: protocol.experiment_id,
    protocol_id: protocol.protocol_id,
    protocol_version: protocol.protocol_version,
    protocol_status: protocol.status,
    preregistration_digest: preregistrationDigest,
    protocol_snapshot_digest: sha256Canonical(protocol),
    sessions,
    report,
    chain_head: previous,
    timestamp_authority: "NONE",
    identity_signature: "NONE",
    authorship_proof: false,
    trusted_timestamp_proof: false,
    causal_proof: false,
    metaphysical_proof: false,
    claim_boundary: HNK_EXPERIMENT_ATTESTATION_BOUNDARY,
  });

  const selfIssues = validateSelf(attestation);
  if (selfIssues.length) throw new Error(`generated invalid experiment attestation: ${selfIssues.join("; ")}`);
  return attestation;
}

export function validateExperimentAttestation(attestation) {
  const issues = validateSelf(attestation);
  return deepFreeze({ ok: issues.length === 0, issues });
}

export function verifyExperimentAttestation(attestation, protocol) {
  const issues = [...validateSelf(attestation)];
  const protocolValidation = validateExperimentProtocol(protocol);
  if (!protocolValidation.ok) issues.push(...protocolValidation.issues.map((issue) => `protocol: ${issue}`));

  if (!issues.length) {
    const expected = createExperimentAttestation(protocol, { generated_at: attestation.generated_at });
    if (expected.experiment_id !== attestation.experiment_id) issues.push("experiment_id mismatch");
    if (expected.protocol_status !== attestation.protocol_status) issues.push("protocol_status mismatch");
    if (expected.preregistration_digest !== attestation.preregistration_digest) issues.push("preregistration digest mismatch");
    if (expected.protocol_snapshot_digest !== attestation.protocol_snapshot_digest) issues.push("protocol snapshot digest mismatch");
    if (expected.sessions.length !== attestation.sessions.length) issues.push("session attestation count mismatch");
    if (canonicalJson(expected.sessions) !== canonicalJson(attestation.sessions)) issues.push("session fingerprint/chain mismatch");
    if (canonicalJson(expected.report) !== canonicalJson(attestation.report)) issues.push("report fingerprint/chain mismatch");
    if (expected.chain_head !== attestation.chain_head) issues.push("chain head mismatch against protocol");
  }

  return deepFreeze({
    ok: issues.length === 0,
    issues,
    preregistration_matches: !issues.includes("preregistration digest mismatch"),
    snapshot_matches: !issues.includes("protocol snapshot digest mismatch"),
    chain_matches: !issues.some((issue) => issue.includes("chain")),
  });
}

export function compareExperimentAttestations(left, right) {
  const leftValidation = validateExperimentAttestation(left);
  const rightValidation = validateExperimentAttestation(right);
  if (!leftValidation.ok) throw new Error(`left attestation invalid: ${leftValidation.issues.join("; ")}`);
  if (!rightValidation.ok) throw new Error(`right attestation invalid: ${rightValidation.issues.join("; ")}`);
  return deepFreeze({
    same_experiment: left.experiment_id === right.experiment_id,
    same_preregistration: left.preregistration_digest === right.preregistration_digest,
    same_snapshot: left.protocol_snapshot_digest === right.protocol_snapshot_digest,
    same_chain_head: left.chain_head === right.chain_head,
    left_status: left.protocol_status,
    right_status: right.protocol_status,
    left_sessions: left.sessions.length,
    right_sessions: right.sessions.length,
    left_has_report: Boolean(left.report),
    right_has_report: Boolean(right.report),
  });
}

export function serializeExperimentAttestation(attestation) {
  const validation = validateExperimentAttestation(attestation);
  if (!validation.ok) throw new Error(`cannot serialize invalid experiment attestation: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(attestation, null, 2)}\n`;
}

export function parseExperimentAttestation(text) {
  if (!nonEmpty(text)) throw new TypeError("attestation JSON text required");
  let attestation;
  try {
    attestation = JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid experiment attestation JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }
  const validation = validateExperimentAttestation(attestation);
  if (!validation.ok) throw new Error(`invalid experiment attestation: ${validation.issues.join("; ")}`);
  return deepFreeze(attestation);
}

export function experimentAttestationSummary() {
  return deepFreeze({
    attestation_id: HNK_EXPERIMENT_ATTESTATION_ID,
    version: HNK_EXPERIMENT_ATTESTATION_VERSION,
    algorithm: HNK_EXPERIMENT_ATTESTATION_ALGORITHM,
    scope: HNK_EXPERIMENT_ATTESTATION_SCOPE,
    preregistration_fingerprint: true,
    artifact_fingerprints: true,
    hash_chain: true,
    report_fingerprint: true,
    deterministic_verification: true,
    timestamp_authority: "NONE",
    identity_signature: "NONE",
    authorship_proof: false,
    trusted_timestamp_proof: false,
    causal_proof: false,
    metaphysical_proof: false,
    claim_boundary: HNK_EXPERIMENT_ATTESTATION_BOUNDARY,
  });
}
