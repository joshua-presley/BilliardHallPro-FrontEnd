import type { Category } from "../types/models/menu/Category";
import type { MenuItem } from "../types/models/menu/MenuItem";
import apiClient from "./client";

export async function getCategories(): Promise<Category[]>
{
    const res = await apiClient.get<Category[]>('categories/');
    return res.data
}

export async function getMenuItems(): Promise<MenuItem[]>{
    const res = await apiClient.get<MenuItem[]>('menu-items/');
    return res.data
}