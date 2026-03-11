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

    const isAdmin = storeRoles.includes("Admin");
    const isSubAdmin = storeRoles.includes("SubAdmin");
    const isTeacher = storeRoles.includes("Teacher");
    const hasAdminAccess = isAdmin || isSubAdmin;
    const hasStoreAccess = storeRoles.includes("User");

    return {
        isAdmin,
        isSubAdmin,
        isTeacher,
        hasAdminAccess,
        hasStoreAccess,
        portalAccess,
        storeRoles,
    };
}

export default useRole;
