export type VaultEntryKind = 'mirror' | 'intention' | 'dream' | 'distraction' | 'journal';
export type VaultRecoveryState = 'DEVICE_BOUND' | 'RECOVERY_READY';

export interface VaultSaveTextInput {
  userId: string;
  day: number | null;
  kind: VaultEntryKind;
  plaintext: string;
}

export interface VaultTextReference {
  entryId: string;
  day: number | null;
  kind: VaultEntryKind;
  cryptoAlg: 'AES-256-GCM';
  cryptoVersion: 1;
  recoveryState: VaultRecoveryState;
}

export interface VaultCapability {
  encryptedText: true;
  serverReceivesPlaintext: false;
  deviceBound: boolean;
  recoveryConfigured: boolean;
}

export interface VaultTextPort {
  capability(): VaultCapability;
  saveText(input: VaultSaveTextInput): Promise<VaultTextReference>;
}

export type VaultMediaKind = 'audio';

export interface VaultSaveMediaInput {
  userId: string;
  day: number | null;
  kind: VaultMediaKind;
  mimeType: string;
  bytes: Uint8Array;
  durationSeconds: number;
}

export interface VaultMediaReference {
  localRef: string;
  day: number | null;
  kind: VaultMediaKind;
  mimeType: string;
  byteLength: number;
  durationSeconds: number;
  cryptoAlg: 'AES-256-GCM';
  cryptoVersion: 1;
  ciphertextChecksumSha256: string;
  recoveryState: 'DEVICE_BOUND';
}

export interface VaultMediaCapability {
  encryptedMedia: true;
  serverReceivesRawMedia: false;
  deviceBound: true;
  recoveryConfigured: false;
}

export interface VaultMediaLoadResult {
  mimeType: string;
  bytes: Uint8Array;
  durationSeconds: number;
}

export interface VaultMediaPort {
  capability(): VaultMediaCapability;
  saveMedia(input: VaultSaveMediaInput): Promise<VaultMediaReference>;
  loadMedia(userId: string, localRef: string): Promise<VaultMediaLoadResult>;
  deleteMedia(userId: string, localRef: string): Promise<void>;
}
