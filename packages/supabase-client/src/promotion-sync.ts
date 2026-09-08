export type PortalPromotionPhase =
  | 'PORTAL_IN_PROGRESS'
  | 'PROMOTION_PENDING_SYNC'
  | 'PROMOTION_SYNC_ERROR'
  | 'PROMOTION_REJECTED'
  | 'PROMOTED';

export type PortalSyncTransport = 'offline' | 'pending' | 'failed' | 'confirmed';

export interface ConfirmedInitiatoryState {
  grade: number;
  title: string;
}

export interface PortalServerConfirmation {
  grade: number;
  title: string;
  ketherComplete: boolean;
}

export interface PortalPromotionInput {
  localPortalCompleted: boolean;
  transport: PortalSyncTransport;
  lastConfirmed: ConfirmedInitiatoryState;
  serverConfirmation?: PortalServerConfirmation | null;
}

export interface PortalPromotionResolution {
  phase: PortalPromotionPhase;
  ceremonyAllowed: boolean;
  officialGrade: number;
  officialTitle: string;
}

/**
 * Kether-specific promotion reconciliation.
 *
 * A local Day 036 completion is never sufficient to display the Iniciado
 * ceremony. Promotion becomes official only after a backend-confirmed response
 * proves Grade 2 / Iniciado and Kether complete.
 */
export function resolveKetherPortalPromotion(
  input: PortalPromotionInput,
): PortalPromotionResolution {
  const pendingOfficialState = {
    ceremonyAllowed: false,
    officialGrade: input.lastConfirmed.grade,
    officialTitle: input.lastConfirmed.title,
  } as const;

  if (!input.localPortalCompleted) {
    return {
      phase: 'PORTAL_IN_PROGRESS',
      ...pendingOfficialState,
    };
  }

  if (input.transport === 'offline' || input.transport === 'pending') {
    return {
      phase: 'PROMOTION_PENDING_SYNC',
      ...pendingOfficialState,
    };
  }

  if (input.transport === 'failed') {
    return {
      phase: 'PROMOTION_SYNC_ERROR',
      ...pendingOfficialState,
    };
  }

  const confirmation = input.serverConfirmation;
  const validPromotion =
    confirmation?.grade === 2 &&
    confirmation.title === 'Iniciado' &&
    confirmation.ketherComplete === true;

  if (!validPromotion) {
    return {
      phase: 'PROMOTION_REJECTED',
      ...pendingOfficialState,
    };
  }

  return {
    phase: 'PROMOTED',
    ceremonyAllowed: true,
    officialGrade: confirmation.grade,
    officialTitle: confirmation.title,
  };
}
