
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * Component which redirects the user to login if they are not authenticated.
 */
function ProtectedRoute() { 
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if(isLoading) { 
        return <div>Loading...</div>;
    }
    if(!user) { 
        return <Navigate to="/login" state={{from: location.pathname }} replace />
    }
    return <Outlet />

}

export default ProtectedRoute