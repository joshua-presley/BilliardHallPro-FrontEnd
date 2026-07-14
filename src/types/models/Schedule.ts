import type { TableInterval } from "./TableInterval";

export interface Schedule {
  id: number;
  name: string;
  intervals: TableInterval[];
  created_at: string;
  updated_at: string;
}