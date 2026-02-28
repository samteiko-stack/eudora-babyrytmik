import { create } from 'zustand';
import { Registration, WeekAvailability } from '@/types';
import { storage } from './storage';
import { formatDate, getNext10Weeks } from './dates';

interface AppState {
  registrations: Registration[];
  weekAvailability: Record<string, WeekAvailability>;
  
  // Actions
  addRegistration: (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  deleteRegistration: (id: string) => void;
  cancelRegistration: (id: string) => void;
  toggleWeekAvailability: (weekStart: string) => void;
  initializeWeeks: () => void;
  getWeekRegistrations: (weekStart: string, location: 'sodermalm' | 'gardet') => Registration[];
  loadFromStorage: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  registrations: [],
  weekAvailability: {},

  loadFromStorage: () => {
    const registrations = storage.getRegistrations();
    const weekAvailability = storage.getWeekAvailability();
    set({ registrations, weekAvailability });
  },

  initializeWeeks: () => {
    const weeks = getNext10Weeks();
    const availability: Record<string, WeekAvailability> = {};
    
    weeks.forEach(week => {
      const weekKey = formatDate(week);
      if (!get().weekAvailability[weekKey]) {
        availability[weekKey] = {
          weekStart: weekKey,
          isAvailable: true,
          registrations: 0,
          maxCapacity: 15,
        };
      }
    });

    const merged = { ...get().weekAvailability, ...availability };
    set({ weekAvailability: merged });
    storage.saveWeekAvailability(merged);
  },

  addRegistration: (registration) => {
    const { weekStart, location } = registration;
    const weekRegs = get().getWeekRegistrations(weekStart, location);
    const weekAvail = get().weekAvailability[weekStart];

    if (!weekAvail?.isAvailable) {
      return { success: false, message: 'Denna vecka är inte tillgänglig för anmälan.' };
    }

    if (weekRegs.length >= 15) {
      return { success: false, message: 'Denna vecka är fullbokad. Vänligen välj en annan vecka.' };
    }

    const newRegistration: Registration = {
      ...registration,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const updatedRegistrations = [...get().registrations, newRegistration];
    set({ registrations: updatedRegistrations });
    storage.saveRegistrations(updatedRegistrations);

    return { success: true, message: 'Anmälan genomförd!' };
  },

  deleteRegistration: (id) => {
    const updatedRegistrations = get().registrations.filter(r => r.id !== id);
    set({ registrations: updatedRegistrations });
    storage.saveRegistrations(updatedRegistrations);
  },

  cancelRegistration: (id) => {
    const updatedRegistrations = get().registrations.map(r => 
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );
    set({ registrations: updatedRegistrations });
    storage.saveRegistrations(updatedRegistrations);
  },

  toggleWeekAvailability: (weekStart) => {
    const updated = {
      ...get().weekAvailability,
      [weekStart]: {
        ...get().weekAvailability[weekStart],
        isAvailable: !get().weekAvailability[weekStart]?.isAvailable,
      },
    };
    set({ weekAvailability: updated });
    storage.saveWeekAvailability(updated);
  },

  getWeekRegistrations: (weekStart, location) => {
    return get().registrations.filter(
      r => r.weekStart === weekStart && r.location === location && r.status !== 'cancelled'
    );
  },
}));
