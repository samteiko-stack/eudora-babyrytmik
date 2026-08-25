'use client';

import { useEffect } from 'react';

const STYLE_ID = 'babysang-styles';

export function AdminStyleGuard() {
  useEffect(() => {
    document.getElementById(STYLE_ID)?.remove();
  }, []);

  return null;
}
