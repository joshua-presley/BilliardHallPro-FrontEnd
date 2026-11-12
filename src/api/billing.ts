import apiClient from "./client";
import type { Bill } from "../types/models/billing/Bill";

/**
 * Fetch session bills from the back end for a given session
 * @param sessionId ID of the session to find bills for.
 * @returns Array of bills. Empty array if none. 
 * @throws 404 if a session that doesn't exist is passed in.
 */
export async function getSessionBills(sessionId: string): Promise<Bill[]> { 
    const res = await apiClient.get('bills/', { params: { session: sessionId }})
    return res.data
}

/**
 * Add a new menu item to the given bill.
 * Creates the bill on the back end if it 
 * does not already exist.
 * @returns The bill with the new lineItem added.
 */
export async function addMenuItem(
    sessionId: string,
    playerId: string,
    menuItemId: string
): Promise<Bill> { 
    const res = await apiClient.post<Bill>(`sessions/${sessionId}/order`, {
        playerId: playerId,
        menu_item_id: menuItemId
    })
    return res.data
}