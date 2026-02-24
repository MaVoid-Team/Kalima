export function useRole() {
    const getPortalAccess = () => {
        try {
            const stored = localStorage.getItem('portalAccess');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };

    const portalAccess = getPortalAccess();

    const storeAccess = portalAccess?.store || { hasAccess: false, roles: [] };
    const storeRoles = storeAccess.roles || [];

    const isAdmin = storeRoles.includes('Admin');
    const isSubAdmin = storeRoles.includes('SubAdmin');
    const hasAdminAccess = isAdmin || isSubAdmin;

    return {
        isAdmin,
        isSubAdmin,
        hasAdminAccess,
        portalAccess,
        storeRoles,
    };
}

export default useRole;
