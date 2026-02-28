export const AUTH_KEY = 'babyrytmik_admin_auth';
export const AUTH_USER_KEY = 'babyrytmik_admin_user';

const ADMIN_USERS = [
  { email: 'suki.ogunkanmi@eudoraforskola.se', password: 'babyrytmik2024', name: 'Suki Ogunkanmi' },
  { email: 'mary.carlsson@eudoraforskola.se', password: 'babyrytmik2024', name: 'Mary Carlsson' },
];

export const auth = {
  login: (email: string, password: string): boolean => {
    const user = ADMIN_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'authenticated');
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ email: user.email, name: user.name }));
      }
      return true;
    }
    return false;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_KEY) === 'authenticated';
  },

  getCurrentUser: (): { email: string; name: string } | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
};
