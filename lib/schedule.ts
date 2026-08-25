export type Location = 'sodermalm' | 'gardet';
export type TimeSlot = 'morning' | 'afternoon';

export const MAX_CAPACITY_PER_SESSION = 15;

export const LOCATIONS = {
  sodermalm: {
    label: 'Södermalm',
    address: 'Fatburs Brunnsg 17',
    day: 'Torsdagar',
    dayShort: 'Torsdag',
  },
  gardet: {
    label: 'Gärdet',
    address: 'Sandhamnsg 7',
    day: 'Onsdagar',
    dayShort: 'Onsdag',
  },
} as const;

export const TIME_SLOTS = {
  morning: {
    label: 'Förmiddag',
    time: '10:00–11:00',
  },
  afternoon: {
    label: 'Eftermiddag',
    time: '13:00–14:00',
  },
} as const;

export interface Session {
  location: Location;
  timeSlot: TimeSlot;
  label: string;
  day: string;
  time: string;
  address: string;
}

export const SESSIONS: Session[] = (Object.keys(LOCATIONS) as Location[]).flatMap(
  (location) =>
    (Object.keys(TIME_SLOTS) as TimeSlot[]).map((timeSlot) => ({
      location,
      timeSlot,
      label: LOCATIONS[location].label,
      day: LOCATIONS[location].dayShort,
      time: TIME_SLOTS[timeSlot].time,
      address: LOCATIONS[location].address,
    }))
);

export function getSessionKey(location: Location, timeSlot: TimeSlot): string {
  return `${location}-${timeSlot}`;
}

export function parseSessionKey(key: string): { location: Location; timeSlot: TimeSlot } | null {
  const [location, timeSlot] = key.split('-') as [Location?, TimeSlot?];
  if (!location || !timeSlot) return null;
  if (!(location in LOCATIONS) || !(timeSlot in TIME_SLOTS)) return null;
  return { location, timeSlot };
}

export function formatSessionRadioLabel(location: Location, timeSlot: TimeSlot): string {
  const loc = LOCATIONS[location];
  const slot = TIME_SLOTS[timeSlot];
  return `Eudora ${loc.label} · ${loc.dayShort} ${slot.time}`;
}

export function formatSessionLabel(location: Location, timeSlot: TimeSlot): string {
  const loc = LOCATIONS[location];
  const slot = TIME_SLOTS[timeSlot];
  return `${loc.label} · ${loc.dayShort} ${slot.time}`;
}

export function formatLocationSchedule(location: Location): string {
  const loc = LOCATIONS[location];
  return `${loc.label} (${loc.address}) ${loc.day.toLowerCase()} kl. ${TIME_SLOTS.morning.time} och ${TIME_SLOTS.afternoon.time}`;
}
