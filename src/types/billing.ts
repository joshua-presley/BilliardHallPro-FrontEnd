export type LineItemType = 'table_time' | 'food' | 'bar' | 'other'; // extend here for new charge sources

export interface LineItem {
  id: string;
  type: LineItemType;
  description: string;
  amount: number; // dollars; see note in CloseSessionModal re: Decimal precision
}

export type DiscountType = 'member' | 'senior' | 'one_time' | 'other'; // extend here for new discount kinds

export interface Discount {
  id: string;
  type: DiscountType;
  description: string;
  percentOff?: number;
  amountOff?: number;
}

export interface Bill {
  id: string;
  playerIds: number[]; // empty when not split, or for an unattributed group bill
  lineItems: LineItem[];
  discounts: Discount[];
  sentToPOS: boolean;
}

export function calculateBillTotal(bill: Bill): number {
  const subtotal = bill.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountTotal = bill.discounts.reduce((sum, discount) => {
    if (discount.percentOff) return sum + subtotal * (discount.percentOff / 100);
    if (discount.amountOff) return sum + discount.amountOff;
    return sum;
  }, 0);
  return Math.max(0, subtotal - discountTotal);
}

export type BillingMode = 'single' | 'split';

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'member', label: 'Member Discount' },
  { value: 'senior', label: 'Senior Discount' },
  { value: 'one_time', label: 'One-Time Discount' },
  { value: 'other', label: 'Other' },
];
