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

    const academyAccess = portalAccess?.academy || { hasAccess: false, roles: [] };
    const academyRoles = academyAccess.roles || [];

    const isAdmin = storeRoles.includes("Admin");
    const isSubAdmin = storeRoles.includes("SubAdmin");
    const isTeacher = storeRoles.includes("Teacher");
    const isStudent = storeRoles.includes("Student") || academyRoles.includes("Student");
    const isParent = storeRoles.includes("Parent") || academyRoles.includes("Parent");
    const hasAdminAccess = isAdmin || isSubAdmin;
    const hasStoreAccess = storeRoles.includes("User") || storeRoles.length > 0;

    return {
        isAdmin,
        isSubAdmin,
        isTeacher,
        isStudent,
        isParent,
        hasAdminAccess,
        hasStoreAccess,
        portalAccess,
        storeRoles,
        academyRoles,
    };
}

export default useRole;
