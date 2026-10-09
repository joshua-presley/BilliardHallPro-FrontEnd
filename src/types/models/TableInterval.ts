import type {  RateType } from "./enums";

export interface TableInterval {
  id: number;
  schedule: number; // FK id
  /**
   * @see RateType
   */
  rate_type: RateType
  /**
   * Bitwise value
   */
  day_of_week: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  rate: number;
}

/**
 * Do a bitwise comparison of today with the given interval to determine
 * if this schedule is valid for today.
 * @param interval The interval we are testing against.
 * @returns True if this interval is valid for today, false otherwise
 * @remarks this DOES NOT test whether the time is valid. Only the day.
 */
export function intervalIsValidToday(interval: TableInterval): boolean { 
  const today = new Date().getDay()
  const bitwiseDay = numericDayToBitwiseDay(today)
  return (bitwiseDay & interval.day_of_week) > 0
}

/**
 * Convert a value from Date().getDay() which returns 0-6
 * into a bitwise value so we can compare against a schedule.
 * @param numericDay numeric representation of the day of the week.
 */
function numericDayToBitwiseDay(numericDay: number): number { 
  return Math.pow(2, numericDay)
}