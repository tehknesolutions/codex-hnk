'use client';

import { useEffect, useState, type PropsWithChildren } from 'react';

export function WebClientHydrationGate({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div data-hnk-hydration-gate="pending" aria-busy="true" />;
  }

  return <>{children}</>;
}
