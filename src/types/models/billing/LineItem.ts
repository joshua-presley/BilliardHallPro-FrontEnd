export type LineItemType = 'table_time' | 'menu' | 'other';

export interface LineItem {
  id: string;
  bill: string;
  type: LineItemType;
  description: string;
  menu_item: string | null;
  amount: string;
}


