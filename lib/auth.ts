export const AUTH_KEY = 'babyrytmik_admin_auth';

export const auth = {
  login: (username: string, password: string): boolean => {
    const validUsername = 'admin';
    const validPassword = 'babyrytmik2024';
    
    if (username === validUsername && password === validPassword) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'authenticated');
        sessionStorage.setItem(AUTH_KEY, 'authenticated');
      }
      return true;
    }
    return false;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(AUTH_KEY) === 'authenticated';
  },
};
