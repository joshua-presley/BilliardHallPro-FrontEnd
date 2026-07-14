import type { DayOfWeek } from "./enums";

export interface TableInterval {
  id: number;
  schedule: number; // FK id
  day_of_week: DayOfWeek;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  hourly_rate: string; // Decimal serialized as string
}