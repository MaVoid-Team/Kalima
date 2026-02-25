import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/auth/useAuth';
import useRole from '../hooks/useRole';
import LoadingSpinner from './ui/loading-spinner';

const AdminRoute = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { hasAdminAccess } = useRole();
    const location = useLocation();

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasAdminAccess) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
