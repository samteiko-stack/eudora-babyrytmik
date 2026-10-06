'use client';

import Link from 'next/link';
import { mainSitePath } from '@/lib/site-url';

export function SiteNav() {
  return (
    <header className="navbar5_component w-nav">
      <div className="navbar5_container container-large">
        <a href={mainSitePath('/')} className="navbar5_logo-link w-nav-brand">
          <img
            loading="eager"
            decoding="sync"
            width="199"
            height="40"
            src="/assets/logo-nav.svg"
            alt="Eudora Internationella Förskola"
            className="navbar5_logo"
          />
        </a>

        <div className="navbar5_menu-right">
          <Link href="/admin/login" className="button is-small is-secondary w-button">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
