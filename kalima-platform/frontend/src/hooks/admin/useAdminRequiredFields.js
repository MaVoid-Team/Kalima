import { useCallback, useState } from 'react';
import useApiMutation from '../useApiMutation';
import {
  normalizeRequiredFieldsPagination,
  REQUIRED_FIELDS_PAGE_SIZE,
} from '@/utils/requiredFieldsPagination';

/**
 * Hook for managing required field definitions CRUD operations
 * Base URL: /api/v2/required-fields
 */
export default function useAdminRequiredFields() {
  const { mutate: apiMutate, loading: apiLoading } = useApiMutation();
  const [fetching, setFetching] = useState(false);
  const [state, setState] = useState({
    fields: [],
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      pages: 1,
      limit: REQUIRED_FIELDS_PAGE_SIZE,
    },
  });

  const fetchAllFields = useCallback(
    async ({ active, page, limit, search } = {}) => {
      setFetching(true);
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const query = new URLSearchParams();
        if (active !== undefined && active !== 'all') {
          query.append('active', active);
        }
        if (page) query.append('page', page);
        if (limit) query.append('limit', limit);
        if (search) query.append('search', search);

        const res = await apiMutate({
          endpoint: `/required-fields/definitions${query.toString() ? `?${query.toString()}` : ''}`,
          method: 'get',
        });

        if (res?.success) {
          setState((prev) => ({
            ...prev,
            fields: res.data || [],
            pagination: normalizeRequiredFieldsPagination(res, {
              page: page || prev.pagination.page,
              limit: limit || prev.pagination.limit,
            }),
          }));
        }
        return res;
      } finally {
        setFetching(false);
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [apiMutate],
  );

  const getFieldById = useCallback(
    async (id) => {
      try {
        const res = await apiMutate({
          endpoint: `/required-fields/definitions/${id}`,
          method: 'get',
        });
        return res;
      } catch (error) {
        console.error('Failed to fetch field by ID:', error);
        throw error;
      }
    },
    [apiMutate],
  );

  const createField = useCallback(
    async (data) => {
      const res = await apiMutate({
        endpoint: '/required-fields/definitions',
        method: 'post',
        data,
        successMessageKey: 'requiredFields.messages.createSuccess',
      });
      if (res?.success) {
        setState((prev) => ({
          ...prev,
          fields: [res.data, ...prev.fields],
        }));
      }
      return res;
    },
    [apiMutate],
  );

  const updateField = useCallback(
    async (id, data) => {
      const res = await apiMutate({
        endpoint: `/required-fields/definitions/${id}`,
        method: 'patch',
        data,
        successMessageKey: 'requiredFields.messages.updateSuccess',
      });
      if (res?.success) {
        setState((prev) => ({
          ...prev,
          fields: prev.fields.map((field) =>
            field.id === id ? { ...field, ...(res.data || data) } : field
          ),
        }));
      }
      return res;
    },
    [apiMutate],
  );

  const deleteField = useCallback(
    async (id) => {
      const res = await apiMutate({
        endpoint: `/required-fields/definitions/${id}`,
        method: 'delete',
        successMessageKey: 'requiredFields.messages.deleteSuccess',
      });
      if (res?.success) {
        setState((prev) => ({
          ...prev,
          fields: prev.fields.filter((field) => field.id !== id),
        }));
      }
      return res;
    },
    [apiMutate],
  );

  return {
    ...state,
    loading: fetching || apiLoading,
    fetchAllFields,
    getFieldById,
    createField,
    updateField,
    deleteField,
  };
}
