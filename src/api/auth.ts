import apiClient from "./client"
import type { User, LoginCredentials } from "../types/auth"

/**
 * Fetch the current CSRF Cookie
 */
export async function fetchCsrfCookie(): Promise<void> {
    await apiClient.get('auth/csrf')
}

/**
 * Authenticate with the back end
 * @param credentials User and password
 * @returns logged in user.
 */
export async function login(credentials: LoginCredentials): Promise<User> { 
    const res = await apiClient.post<User>('auth/login/', credentials)
    return res.data
}

/**
 * Log this user out of the application.
 */
export async function logout(): Promise<void> { 
    await apiClient.post('auth/logout/')
}

/**
 * Check if somebody is logged in.
 * @returns Current user if logged in, undefined otherwise
 */
export async function fetchCurrentUser(): Promise<User> {
    const res = await apiClient.get<User>('auth/me/')
    return res.data
}