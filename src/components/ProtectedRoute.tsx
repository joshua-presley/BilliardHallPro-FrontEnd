
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next"

/**
 * Component which redirects the user to login if they are not authenticated.
 */
function ProtectedRoute() { 
    const { user, isLoading } = useAuth()
    const location = useLocation()
    const { t } = useTranslation()

    if(isLoading) { 
        return <div>{t("Common.Loading")}...</div>;
    }
    if(!user) { 
        return <Navigate to="/login" state={{from: location.pathname }} replace />
    }
    return <Outlet />

}

export default ProtectedRoute