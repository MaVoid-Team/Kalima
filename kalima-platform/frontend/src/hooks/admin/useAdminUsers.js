import { useState, useCallback } from 'react';
import useApiMutation from '../useApiMutation';

export const useAdminUsers = () => {
    const { mutate: fetchApi, loading: apiLoading } = useApiMutation();

    // List State
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 10
    });
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        portal: '',
        isDeleted: 'all'
    });

    // Detail State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);

    const [initLoading, setInitLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loading = apiLoading || initLoading;

    const buildQuery = useCallback(() => {
        const query = new URLSearchParams({
            page: pagination.page,
            limit: pagination.limit,
        });

        if (filters.search) query.append('search', filters.search);
        if (filters.role && filters.role !== 'all') query.append('role', filters.role);
        if (filters.portal && filters.portal !== 'all') query.append('portal', filters.portal);
        if (filters.isDeleted && filters.isDeleted !== 'all') query.append('isDeleted', filters.isDeleted);

        return query.toString();
    }, [pagination.page, pagination.limit, filters]);

    const fetchUsers = useCallback(async () => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/admin/users?${buildQuery()}`,
                method: 'get'
            });

            if (data?.success) {
                const resultData = data.data?.users || [];
                setUsers(resultData);

                const responsePage = data.data?.pagination || data.pagination || {};
                setPagination(prev => ({
                    ...prev,
                    total: responsePage.total ?? prev.total,
                    page: responsePage.page ?? prev.page,
                    pages: responsePage.totalPages ?? responsePage.pages ?? prev.pages,
                    limit: responsePage.limit ?? prev.limit,
                }));
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi, buildQuery]);

    const fetchUserById = useCallback(async (userId) => {
        setInitLoading(true);
        try {
            const data = await fetchApi({
                endpoint: `/admin/users/${userId}`,
                method: 'get'
            });

            if (data?.success) {
                setSelectedUser(data.data);
            } else {
                setSelectedUser(null);
            }
        } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            setSelectedUser(null);
        } finally {
            setInitLoading(false);
        }
    }, [fetchApi]);

    const fetchUserRoles = useCallback(async (userId) => {
        try {
            const data = await fetchApi({
                endpoint: `/admin/users/${userId}/roles`,
                method: 'get'
            });

            if (data?.success) {
                setUserRoles(data.data?.roles || []);
            } else {
                setUserRoles([]);
            }
        } catch (error) {
            console.error(`Failed to fetch user roles for ${userId}:`, error);
            setUserRoles([]);
        }
    }, [fetchApi]);

    const handleAction = async (actionFn) => {
        setActionLoading(true);
        try {
            return await actionFn();
        } finally {
            setActionLoading(false);
        }
    };

    // Role Management
    const assignRole = (userId, portal, role) =>
        handleAction(() => fetchApi({
            endpoint: `/admin/users/${userId}/roles`,
            method: 'post',
            data: { portal, role }
        }).then(res => {
            fetchUserRoles(userId);
            return res;
        }));

    const revokeRole = (userId, portal, role) =>
        handleAction(() => fetchApi({
            endpoint: `/admin/users/${userId}/roles`,
            method: 'delete',
            data: { portal, role }
        }).then(res => {
            fetchUserRoles(userId);
            return res;
        }));

    const setRolesBulk = (userId, rolesArray) =>
        handleAction(() => fetchApi({
            endpoint: `/admin/users/${userId}/roles`,
            method: 'put',
            data: { roles: rolesArray }
        }).then(res => {
            fetchUserRoles(userId);
            return res;
        }));

    // Admin Creation Endpoints (Auth API)
    const createAdminUser = (userData) =>
        handleAction(() => fetchApi({
            endpoint: '/auth/admin/create-admin',
            method: 'post',
            data: userData
        }));

    const createSubAdminUser = (userData) =>
        handleAction(() => fetchApi({
            endpoint: '/auth/admin/create-subadmin',
            method: 'post',
            data: userData
        }));

    const createModeratorUser = (userData) =>
        handleAction(() => fetchApi({
            endpoint: '/auth/admin/create-moderator',
            method: 'post',
            data: userData
        }));

    const createAssistantUser = (userData) =>
        handleAction(() => fetchApi({
            endpoint: '/auth/admin/create-assistant',
            method: 'post',
            data: userData
        }));

    const deleteUser = (userId) =>
        handleAction(() => fetchApi({
            endpoint: `/admin/users/${userId}`,
            method: 'delete'
        }));

    // Setters
    const setSearch = useCallback((query) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setRole = useCallback((role) => {
        setFilters((prev) => ({ ...prev, role }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setPortal = useCallback((portal) => {
        setFilters((prev) => ({ ...prev, portal }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setIsDeleted = useCallback((isDeleted) => {
        setFilters((prev) => ({ ...prev, isDeleted }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    return {
        // State
        users,
        pagination,
        filters,
        selectedUser,
        userRoles,
        loading,
        actionLoading,

        // Actions
        fetchUsers,
        fetchUserById,
        fetchUserRoles,

        assignRole,
        revokeRole,
        setRolesBulk,

        createAdminUser,
        createSubAdminUser,
        createModeratorUser,
        createAssistantUser,
        deleteUser,

        // Setters
        setSearch,
        setRole,
        setPortal,
        setIsDeleted,
        setPage
    };
};

export default useAdminUsers;
