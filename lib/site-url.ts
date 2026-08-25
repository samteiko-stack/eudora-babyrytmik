export const MAIN_SITE_URL = 'https://eudoraforskola.se';

export function mainSitePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${MAIN_SITE_URL}${normalized}`;
}
