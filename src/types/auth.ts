/**
 * Simple shape of user object for Django auth
 */
export interface User { 
    id: number
    username: string
    is_staff: boolean
}

/**
 * Contains username and password for login.
 */
export interface LoginCredentials { 
    username: string
    password: string
}