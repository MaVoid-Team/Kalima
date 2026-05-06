import { useCallback, useState } from "react";
import useApiMutation from "../useApiMutation";

const normalizeListResponse = (response) => ({
  data: Array.isArray(response?.data) ? response.data : [],
  total: Number(response?.total ?? 0),
  page: Number(response?.page ?? 1),
  limit: Number(response?.limit ?? 20),
});

export function useAdminEBookletTemplates() {
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [initLoading, setInitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const buildQuery = useCallback(
    (overrides = {}) => {
      const query = new URLSearchParams();
      const nextFilters = { ...filters, ...overrides };
      const nextPage = overrides.page ?? pagination.page;
      const nextLimit = overrides.limit ?? pagination.limit;

      query.set("page", String(nextPage));
      query.set("limit", String(nextLimit));
      if (nextFilters.search) query.set("search", nextFilters.search);
      if (nextFilters.status && nextFilters.status !== "all") {
        query.set("status", nextFilters.status);
      }

      return query.toString();
    },
    [filters, pagination.limit, pagination.page],
  );

  const fetchTemplates = useCallback(
    async (overrides = {}) => {
      setInitLoading(true);
      try {
        const response = await fetchApi(
          {
            endpoint: `/admin/e-booklet-templates?${buildQuery(overrides)}`,
            method: "get",
          },
          false,
        );
        const normalized = normalizeListResponse(response);
        setTemplates(normalized.data);
        setPagination((current) => ({
          ...current,
          total: normalized.total,
          page: normalized.page,
          limit: normalized.limit,
        }));
        return response;
      } finally {
        setInitLoading(false);
      }
    },
    [buildQuery, fetchApi],
  );

  const setSearch = useCallback((search) => {
    setFilters((current) => ({ ...current, search }));
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const setStatus = useCallback((status) => {
    setFilters((current) => ({ ...current, status }));
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setPagination((current) => ({ ...current, page }));
  }, []);

  const runAction = useCallback(async (action) => {
    setActionLoading(true);
    try {
      return await action();
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(
    (templateId, data) =>
      runAction(() =>
        fetchApi({
          endpoint: `/admin/e-booklet-templates/${templateId}`,
          method: "patch",
          data,
          defaultSuccessMessage: "E-booklet template updated",
        }),
      ),
    [fetchApi, runAction],
  );

  const publishVersion = useCallback(
    (versionId) =>
      runAction(() =>
        fetchApi({
          endpoint: `/admin/e-booklet-template-versions/${versionId}/publish`,
          method: "post",
          defaultSuccessMessage: "E-booklet version published",
        }),
      ),
    [fetchApi, runAction],
  );

  return {
    templates,
    pagination,
    filters,
    loading: apiLoading || initLoading,
    actionLoading,
    fetchTemplates,
    setSearch,
    setStatus,
    setPage,
    updateTemplate,
    publishVersion,
  };
}

export function useAdminEBookletEditor() {
  const { mutate: fetchApi, loading } = useApiMutation();

  const fetchTemplate = useCallback(
    (templateId) =>
      fetchApi(
        {
          endpoint: `/admin/e-booklet-templates/${templateId}`,
          method: "get",
        },
        false,
      ),
    [fetchApi],
  );

  const fetchVersions = useCallback(
    (templateId) =>
      fetchApi(
        {
          endpoint: `/admin/e-booklet-templates/${templateId}/versions`,
          method: "get",
        },
        false,
      ),
    [fetchApi],
  );

  const createTemplate = useCallback(
    (data) =>
      fetchApi({
        endpoint: "/admin/e-booklet-templates",
        method: "post",
        data,
        defaultSuccessMessage: "E-booklet template saved",
      }),
    [fetchApi],
  );

  const updateTemplate = useCallback(
    (templateId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-templates/${templateId}`,
        method: "patch",
        data,
        defaultSuccessMessage: "E-booklet template updated",
      }),
    [fetchApi],
  );

  const createVersion = useCallback(
    (templateId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-templates/${templateId}/versions`,
        method: "post",
        data,
        defaultSuccessMessage: "E-booklet version saved",
      }),
    [fetchApi],
  );

  const updateVersion = useCallback(
    (versionId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}`,
        method: "patch",
        data,
        defaultSuccessMessage: "E-booklet version updated",
      }),
    [fetchApi],
  );

  const publishVersion = useCallback(
    (versionId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}/publish`,
        method: "post",
        defaultSuccessMessage: "E-booklet version published",
      }),
    [fetchApi],
  );

  const fetchHotspots = useCallback(
    (versionId, pageNumber) => {
      const query = pageNumber ? `?page_number=${pageNumber}` : "";
      return fetchApi(
        {
          endpoint: `/admin/e-booklet-template-versions/${versionId}/hotspots${query}`,
          method: "get",
        },
        false,
      );
    },
    [fetchApi],
  );

  const createHotspot = useCallback(
    (versionId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}/hotspots`,
        method: "post",
        data: { ...data, template_version_id: versionId },
        defaultSuccessMessage: "Hotspot saved",
      }),
    [fetchApi],
  );

  const updateHotspot = useCallback(
    (hotspotId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-hotspots/${hotspotId}`,
        method: "patch",
        data,
        defaultSuccessMessage: "Hotspot updated",
      }),
    [fetchApi],
  );

  const deleteHotspot = useCallback(
    (hotspotId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-hotspots/${hotspotId}`,
        method: "delete",
        defaultSuccessMessage: "Hotspot removed",
      }),
    [fetchApi],
  );

  const uploadAsset = useCallback(
    (kind, file, data = {}) => {
      const formData = new FormData();
      const fieldName = kind === "cover" ? "cover" : kind === "document" ? "document" : "media";
      formData.append(fieldName, file);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      return fetchApi({
        endpoint: `/admin/e-booklet-files/${kind}`,
        method: "post",
        data: formData,
        defaultSuccessMessage: "File stored privately",
      });
    },
    [fetchApi],
  );

  return {
    loading,
    fetchTemplate,
    fetchVersions,
    createTemplate,
    updateTemplate,
    createVersion,
    updateVersion,
    publishVersion,
    fetchHotspots,
    createHotspot,
    updateHotspot,
    deleteHotspot,
    uploadAsset,
  };
}
