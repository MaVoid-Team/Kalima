import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/auth/useAuth';
import useRole from '../hooks/useRole';
import LoadingSpinner from './ui/loading-spinner';


/**
 * RoleRoute - A general purpose route guard for role-based access control.
 * It checks if the authenticated user has at least one of the required roles.
 */
const RoleRoute = ({ requiredRole }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { storeRoles, academyRoles } = useRole();
    const location = useLocation();

    // Ensure requiredRole is an array for easy checking
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Check both store portal roles AND academy portal roles
    const allRoles = [...storeRoles, ...academyRoles];
    const hasRequiredRole = rolesArray.some(role => allRoles.includes(role));

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasRequiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
