import { startOfWeek, addWeeks, format, parseISO } from 'date-fns';

export const getMonday = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const getNext10Weeks = (): Date[] => {
  const today = new Date();
  const nextMonday = getMonday(addWeeks(today, 1));
  
  return Array.from({ length: 10 }, (_, i) => addWeeks(nextMonday, i));
};

export const getAllWeeksOfYear = (): Date[] => {
  const today = new Date();
  const year = today.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const firstMonday = getMonday(firstDay);
  
  // Get 52 weeks from the first Monday of the year
  return Array.from({ length: 52 }, (_, i) => addWeeks(firstMonday, i));
};

export const formatWeekRange = (monday: Date): string => {
  const sunday = addWeeks(monday, 0);
  sunday.setDate(monday.getDate() + 6);
  
  return `${format(monday, 'd MMM')} - ${format(sunday, 'd MMM')}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
