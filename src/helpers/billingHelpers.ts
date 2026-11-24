import { v4 } from "uuid";
import { AllBillsDeletedException } from "../exceptions/AllBillsDeletedException";
import type { Bill } from "../types/models/billing/Bill";
import type { DiscountType } from "../types/models/billing/Discount";

/**
 * Calculates the subtotal for this bill. 
 * 
 * `line_items` - `discounts`. Sets `subtotal` property on the bill.
 * @param bill bill object to calculate subtotal for.
 */
export function calculateBillSubtotal(bill: Bill): void {
  const subtotal = bill.line_items.reduce((prev, curr) => prev + Number(curr.amount), 0)
  const discountTotal = bill.discounts.reduce((sum, discount) => {
    if (discount.percent_off) return sum + subtotal * (Number(discount.percent_off) / 100);
    if (discount.amount_off) return sum + Number(discount.amount_off)
    return sum;
  }, 0);
  bill.subtotal = Math.max(0, subtotal - discountTotal).toFixed(2);
}

/**
 * Combine all bills into a single bill. 
 * @param bills Array of bills to merge down to a single bill.
 * @returns The original array but modified. A single 
 * bill will contain all the line_items copied over. 
 * @remarks
 * The other bills remain intact, save for the `deleted` 
 * flag being set to true. We do this to restore them in their original 
 * form if the user decides to go back from "one bill" to "separate bills".
 */
export function mergeBills(bills: Bill[]): Bill[]{ 
  if(bills.length === 1){ 
    return bills
  }
  else{ 
    for(var i = 1; i < bills.length; i++){
      const line_items = bills[i].line_items
      const players = bills[i].player_ids
      const discounts = bills[i].discounts
      bills[0].line_items.push(...line_items)
      bills[0].player_ids.push(...players)
      bills[0].discounts.push(...discounts)
      bills[i].deleted = true
      calculateBillSubtotal(bills[i])
    }
    calculateBillSubtotal(bills[0])
    return bills
  }
}

/**
 * Split bills that have been merged together.
 * @param bills 
 * @remarks This method attempts to restore bills that have
 * been merged together into a single bill. It will loop through 
 * each deleted bill and look for matching line_items on the non
 * deleted bill.
 * 
 * Currently, this method assumes there will be exactly one
 * non-deleted bill. This assumpution is subject to change.
 * 
 * This method can only restore bills to the state they were in before the 
 * most recent merge. We do not bother to keep a history of changes. 
 * An audit table is possible but not worth the memory.
 * @throws {AllBillsDeletedException} if all bills are marked as
 * deleted. There should always be at least one non deleted bill.
 */
export function splitBills(bills: Bill[]): Bill[] { 
  if(bills.every(bill => bill.deleted === true)){
    throw new AllBillsDeletedException()
  }
  if(bills.length === 1){
    return bills
  }
  else{
    //ensure the non deleted bill is first in the list. 
    bills = bills.sort((a, b) => {
      if(!a.deleted && b.deleted){ return -1 }
      if(a.deleted && b.deleted){ return 0 }
      return 1 //!a.deleted && b.deleted
    })

    for (var i = 1; i < bills.length; i++){ 
      bills[0].player_ids = bills[0].player_ids.filter(pi => !bills[i].player_ids.includes(pi))
      bills[0].line_items = bills[0].line_items.filter(li => !bills[i].line_items.map(li => li.id).includes(li.id))
      bills[0].discounts = bills[0].discounts.filter(d => !bills[i].discounts.map(d => d.id).includes(d.id))
      bills[i].deleted = false
      calculateBillSubtotal(bills[i])
    }
    calculateBillSubtotal(bills[0])
    return bills
  }
}

/**
 * Add a new line_item to this bill representing table time .
 * @param bill Bill to add table time line_item to
 * @param share dollar amount of the table time.
 */
export function addTableTime(bill: Bill, share: number): void {
  bill.line_items.push(
    {
      id: v4(),
      bill: bill.id,
      type: 'table_time',
      description: 'Table time',
      menu_item: null,
      amount: share.toFixed(2)
    }
  )
}

export type BillingMode = 'single' | 'split';

/**
 * TODO: Figure out how to make these translation keys
 */
export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'member', label: "Member Discount" },
  { value: 'senior', label: 'Senior Discount' },
  { value: 'one_time', label: 'One Time' },
  { value: 'other', label: 'Other' },
];

