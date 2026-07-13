import apiClient from "./client"
import type { User, LoginCredentials } from "../types/auth"

export async function fetchCsrfCookie(): Promise<void> {
    await apiClient.get('auth/csrf')
}

export async function login(credentials: LoginCredentials): Promise<User> { 
    const res = await apiClient.post<User>('auth/login/', credentials)
    return res.data
}

export async function logout(): Promise<void> { 
    await apiClient.post('auth/logout/')
}

export async function fetchCurrentUser(): Promise<User> {
    const res = await apiClient.get<User>('auth/me/')
    return res.data
}