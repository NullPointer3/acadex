import type { DayOfWeekName } from '../types';

export const DAYS: DayOfWeekName[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function todayDayName(): DayOfWeekName {
  return DAYS[new Date().getDay()];
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}
