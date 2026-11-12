export type DiscountType = 'member' | 'senior' | 'one_time' | 'other';

export interface Discount {
  id: string;
  bill: string;
  type: DiscountType;
  description: string;
  percent_off: string | null;
  amount_off: string | null;
}