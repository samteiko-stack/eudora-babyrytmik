'use client';

import { useEffect } from 'react';

const STYLE_ID = 'babysang-styles';

export function SiteStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;

    const link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = '/css/babysang.css';
    document.head.appendChild(link);

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
