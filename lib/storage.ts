import { Registration, WeekAvailability } from '@/types';

const STORAGE_KEYS = {
  REGISTRATIONS: 'babyrytmik_registrations',
  WEEK_AVAILABILITY: 'babyrytmik_week_availability',
};

export const storage = {
  getRegistrations: (): Registration[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveRegistrations: (registrations: Registration[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  },

  getWeekAvailability: (): Record<string, WeekAvailability> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.WEEK_AVAILABILITY);
    return data ? JSON.parse(data) : {};
  },

  saveWeekAvailability: (availability: Record<string, WeekAvailability>): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.WEEK_AVAILABILITY, JSON.stringify(availability));
  },
};
