import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    // If not logged in, redirect to sign-in with current path in state
    if (!user) {
        return <Navigate to="/sign-in" state={{ returnTo: window.location.pathname }} replace />
    }

    // If admin is required but user is not admin, redirect to home
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
