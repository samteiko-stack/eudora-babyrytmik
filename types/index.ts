export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: 'sodermalm' | 'gardet';
  weekStart: string; // ISO date string
  createdAt: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
}

export interface WeekAvailability {
  weekStart: string; // ISO date string (Monday)
  isAvailable: boolean;
  registrations: number;
  maxCapacity: number;
}

export interface WeekSchedule {
  sodermalm: {
    day: string;
    time: string;
  };
  gardet: {
    day: string;
    time: string;
  };
}
