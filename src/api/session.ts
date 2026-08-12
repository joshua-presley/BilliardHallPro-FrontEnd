import type { SessionType } from "../types/models/enums"
import type { TableSession } from "../types/models/TableSession"
import apiClient from "./client"

/**
 * API payload for creating a session.
 */
interface CreateSessionPayload { 
    table: number
    session_type: SessionType
    rate: string
    player_count: number
    player_ids?: number[]
}

/**
 * Create a new game session.
 * @param payload Data the backend needs to create a new session
 */
export async function createSession(payload: CreateSessionPayload): Promise<TableSession> { 
    const res = await apiClient.post<TableSession>("sessions/", payload)
    return res.data
}