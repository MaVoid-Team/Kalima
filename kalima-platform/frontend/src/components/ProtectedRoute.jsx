import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/auth/useAuth';
import LoadingSpinner from "@/components/ui/loading-spinner";

const ProtectedRoute = ({ requireAuth = true }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!requireAuth && isAuthenticated) {
        // If they are on a guest-only route like login/signup, redirect to the
        // page they came from (preserved in location.state.from) or fall back to home.
        const redirectTo = location.state?.from?.pathname || "/";
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
