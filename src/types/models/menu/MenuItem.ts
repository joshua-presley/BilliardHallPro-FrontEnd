import type { Category } from "./Category"

/**
 * Represents something a player can order from the kitchen or bar.
 */
export interface MenuItem { 
    id: number
    name: string
    price: number
    category: Category
    is_active: boolean
}