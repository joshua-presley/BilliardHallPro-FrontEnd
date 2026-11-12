import type { Discount } from "./Discount";
import type { LineItem } from "./LineItem";

export interface Bill {
  id: string;
  session: string | null;
  player_ids: string[];
  line_items: LineItem[];
  discounts: Discount[];
  sent_to_pos: boolean;
  paid: boolean;
  subtotal: string;
  total: string;
  created_at: string;
  deleted: boolean;
}