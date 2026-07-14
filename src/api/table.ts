import type { Table } from "../types/models/Table";
import apiClient from "./client";

/**
 * Fetch list of all tables from the backend.
 */
export async function getTables(): Promise<Table[]> { 
    const res = await apiClient.get<Table[]>('/tables')
    return res.data
}