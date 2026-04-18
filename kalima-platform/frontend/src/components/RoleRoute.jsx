import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/auth/useAuth';
import useRole from '../hooks/useRole';
import LoadingSpinner from './ui/loading-spinner';


/**
 * RoleRoute - A general purpose route guard for role-based access control.
 * It checks if the authenticated user has at least one of the required roles.
 */
const RoleRoute = ({ requiredRole, excludedRole }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { storeRoles, academyRoles } = useRole();
    const location = useLocation();

    // Ensure props are arrays for easy checking
    const requiredRolesArray = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : [];
    const excludedRolesArray = excludedRole ? (Array.isArray(excludedRole) ? excludedRole : [excludedRole]) : [];

    // Check both store portal roles AND academy portal roles
    const allRoles = [...storeRoles, ...academyRoles];
    
    const hasRequiredRole = requiredRolesArray.length === 0 || requiredRolesArray.some(role => allRoles.includes(role));
    const isExcluded = excludedRolesArray.some(role => allRoles.includes(role));
    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    // Only force login if the route REQUIRE a specific role
    if (!isAuthenticated && requiredRolesArray.length > 0) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, check for exclusion
    if (isAuthenticated && isExcluded) {
        return <Navigate to="/" replace />;
    }

    // If authenticated, check for requirement
    if (isAuthenticated && !hasRequiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
