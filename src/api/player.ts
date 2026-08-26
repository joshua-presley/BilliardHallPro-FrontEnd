import type { Player } from "../types/models/Player";
import apiClient from "./client";

/**
 * Search for member players by name or Member number.
 */
export async function searchPlayers(query: string): Promise<Player[]> {
  if (!query.trim()) return [];
  const res = await apiClient.get<Player[]>('players/', {
    params: { search: query },
  });
  return res.data;
}

/**
 * Get all players in the system.
 * @returns Array of all members
 */
export async function getAllPlayers(): Promise<Player[]> { 
  const res = await apiClient.get<Player[]>('players/');
  return res.data
}