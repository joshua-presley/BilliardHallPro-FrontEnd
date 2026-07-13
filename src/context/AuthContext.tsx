import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/auth'
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, fetchCsrfCookie } from '../api/auth';

interface AuthContextValue { 
    user: User | null
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode}) { 
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false))
    }, [])

    async function login(username: string, password: string) {
        await fetchCsrfCookie();
        const loggedInUser = await loginRequest({ username, password });
        setUser(loggedInUser);
    }

    async function logout() {
        await logoutRequest();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
