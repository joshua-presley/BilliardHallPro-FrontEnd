import type { Bill } from '../types/billing';

/**
 * Placeholder for sending a finalized bill to the POS system.
 * Replace with a real integration once a POS vendor/strategy is chosen.
 * Should eventually return whatever confirmation/receipt data the POS provides.
 */
export async function sendBillToPOS(bill: Bill): Promise<void> {
  console.log('Sending bill to POS (stub):', bill);
  return new Promise((resolve) => setTimeout(resolve, 400));
}