import type { TableType } from "./enums";
import type { Schedule } from "./Schedule";
import type { TableSession } from "./TableSession";

export interface Table {
  id: number;
  name: string;
  max_players: number;
  table_type: TableType;
  schedule: Schedule | null;
  current_session: TableSession | null;
}