import { create } from 'zustand';
import { Registration, WeekAvailability } from '@/types';
import { storage } from './storage';
import { formatDate, getNext10Weeks } from './dates';

interface AppState {
  registrations: Registration[];
  weekAvailability: Record<string, WeekAvailability>;
  isLoading: boolean;
  
  // Actions
  addRegistration: (registration: Omit<Registration, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message: string }>;
  deleteRegistration: (id: string) => Promise<void>;
  cancelRegistration: (id: string) => Promise<void>;
  reactivateRegistration: (id: string) => Promise<void>;
  toggleWeekAvailability: (weekStart: string) => void;
  initializeWeeks: () => void;
  getWeekRegistrations: (weekStart: string, location: 'sodermalm' | 'gardet') => Registration[];
  loadFromDatabase: () => Promise<void>;
  importRegistrations: (registrations: Registration[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  registrations: [],
  weekAvailability: {},
  isLoading: false,

  loadFromDatabase: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/registrations');
      if (response.ok) {
        const registrations = await response.json();
        set({ registrations });
      }
      
      // Still load week availability from localStorage
      const weekAvailability = storage.getWeekAvailability();
      set({ weekAvailability, isLoading: false });
    } catch (error) {
      console.error('Error loading from database:', error);
      set({ isLoading: false });
    }
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

  addRegistration: async (registration) => {
    const { weekStart, location } = registration;
    const weekRegs = get().getWeekRegistrations(weekStart, location);
    const weekAvail = get().weekAvailability[weekStart];

    if (!weekAvail?.isAvailable) {
      return { success: false, message: 'Denna vecka är inte tillgänglig för anmälan.' };
    }

    if (weekRegs.length >= 15) {
      return { success: false, message: 'Denna vecka är fullbokad. Vänligen välj en annan vecka.' };
    }

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration),
      });

      if (response.ok) {
        const newRegistration = await response.json();
        const updatedRegistrations = [...get().registrations, newRegistration];
        set({ registrations: updatedRegistrations });
        return { success: true, message: 'Anmälan genomförd!' };
      }

      return { success: false, message: 'Ett fel uppstod. Försök igen.' };
    } catch (error) {
      console.error('Error adding registration:', error);
      return { success: false, message: 'Ett fel uppstod. Försök igen.' };
    }
  },

  deleteRegistration: async (id) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedRegistrations = get().registrations.filter(r => r.id !== id);
        set({ registrations: updatedRegistrations });
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  },

  cancelRegistration: async (id) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        const updatedRegistrations = get().registrations.map(r => 
          r.id === id ? { ...r, status: 'cancelled' as const } : r
        );
        set({ registrations: updatedRegistrations });
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
    }
  },

  reactivateRegistration: async (id) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (response.ok) {
        const updatedRegistrations = get().registrations.map(r => 
          r.id === id ? { ...r, status: 'confirmed' as const } : r
        );
        set({ registrations: updatedRegistrations });
      }
    } catch (error) {
      console.error('Error reactivating registration:', error);
    }
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

  importRegistrations: (registrations) => {
    set({ registrations });
    storage.saveRegistrations(registrations);
  },
}));
