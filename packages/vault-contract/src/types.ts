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
