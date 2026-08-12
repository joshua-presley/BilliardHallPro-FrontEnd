import type { SessionType } from "./enums";
import type { Player } from "./Player";

export interface TableSession {
  id: number;
  table: number; // FK id
  session_type: SessionType;
  started_at: string; // ISO 8601 datetime string
  ended_at: string | null;
  rate: string; // Decimal as string
  players: Player[];
  opened_by: number | null; // FK id to staff User, or null
  is_active: boolean;
  duration_minutes: number;
  player_count: number;
}