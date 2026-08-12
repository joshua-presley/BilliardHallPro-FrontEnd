import type { Player } from "../types/models/Player";
import apiClient from "./client";
import type { PaginatedResponse } from "./types/PaginatedResponse";

/**
 * Search for member players by name or Member number.
 */
export async function searchPlayers(query: string): Promise<Player[]> {
  if (!query.trim()) return [];
  const res = await apiClient.get<PaginatedResponse<Player>>('players/', {
    params: { search: query },
  });
  return res.data.results;
}