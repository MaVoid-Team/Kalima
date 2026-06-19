import { useCallback, useState } from "react";
import axiosInstance from "@/api/axios";
import i18n from "@/i18n";
import useApiMutation from "../useApiMutation";

const normalizeListResponse = (response) => ({
  data: Array.isArray(response?.data) ? response.data : [],
  total: Number(response?.total ?? 0),
  page: Number(response?.page ?? 1),
  limit: Number(response?.limit ?? 20),
});

const ANALYTICS_QUERY_KEYS = {
  startDate: "start_date",
  endDate: "end_date",
  teacherId: "teacher_id",
  instanceId: "instance_id",
  studentId: "student_id",
};

const buildQueryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(ANALYTICS_QUERY_KEYS[key] || key, String(value));
    }
  });
  return query.toString();
};

export function useAdminEBookletAnalytics() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [analytics, setAnalytics] = useState({ events: {}, revenue: {} });

  const fetchAnalytics = useCallback(async (filters = {}) => {
    const query = buildQueryString(filters);
    const response = await fetchApi(
      {
        endpoint: `/admin/e-booklet-analytics${query ? `?${query}` : ""}`,
        method: "get",
      },
      false,
    );
    setAnalytics(response?.data || { events: {}, revenue: {} });
    return response;
  }, [fetchApi]);

  const exportCsv = useCallback(async (filters = {}) => {
    const query = buildQueryString(filters);
    const response = await axiosInstance.get(
      `/admin/e-booklet-analytics.csv${query ? `?${query}` : ""}`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "e-booklet-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return response;
  }, []);

  return { analytics, loading, fetchAnalytics, exportCsv };
}

export function useAdminTeacherOptions() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: "1", limit: "50", role: "Teacher" });
      if (search.trim()) query.set("search", search.trim());

      const response = await axiosInstance.get(`/admin/users?${query.toString()}`);
      const users = response.data?.data?.users || [];
      setTeachers(Array.isArray(users) ? users : []);
      return users;
    } finally {
      setLoading(false);
    }
  }, []);

  return { teachers, loading, fetchTeachers };
}

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
          defaultSuccessMessage: i18n.t("eBooklets:toasts.templateUpdated"),
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
          defaultSuccessMessage: i18n.t("eBooklets:toasts.versionPublished"),
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
        defaultSuccessMessage: i18n.t("eBooklets:toasts.templateSaved"),
      }),
    [fetchApi],
  );

  const updateTemplate = useCallback(
    (templateId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-templates/${templateId}`,
        method: "patch",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.templateUpdated"),
      }),
    [fetchApi],
  );

  const createVersion = useCallback(
    (templateId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-templates/${templateId}/versions`,
        method: "post",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.versionSaved"),
      }),
    [fetchApi],
  );

  const updateVersion = useCallback(
    (versionId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}`,
        method: "patch",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.versionUpdated"),
      }),
    [fetchApi],
  );

  const publishVersion = useCallback(
    (versionId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}/publish`,
        method: "post",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.versionPublished"),
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
    (versionId, data, options = {}) =>
      fetchApi({
        endpoint: `/admin/e-booklet-template-versions/${versionId}/hotspots`,
        method: "post",
        data: { ...data, template_version_id: versionId },
        defaultSuccessMessage: i18n.t("eBooklets:toasts.hotspotSaved"),
      }, options.showToast !== false),
    [fetchApi],
  );

  const updateHotspot = useCallback(
    (hotspotId, data, options = {}) =>
      fetchApi({
        endpoint: `/admin/e-booklet-hotspots/${hotspotId}`,
        method: "patch",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.hotspotUpdated"),
      }, options.showToast !== false),
    [fetchApi],
  );

  const deleteHotspot = useCallback(
    (hotspotId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-hotspots/${hotspotId}`,
        method: "delete",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.hotspotRemoved"),
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
        defaultSuccessMessage: i18n.t("eBooklets:toasts.fileStored"),
      });
    },
    [fetchApi],
  );

  const fetchAssetBlobUrl = useCallback(async (assetId, params) => {
    if (!assetId) return "";
    const response = await axiosInstance.get(
      `/admin/e-booklet-files/${assetId}/preview`,
      { responseType: "blob", params },
    );
    return URL.createObjectURL(response.data);
  }, []);

  const fetchAssetArrayBuffer = useCallback(async (assetId, params) => {
    if (!assetId) return null;
    const response = await axiosInstance.get(
      `/admin/e-booklet-files/${assetId}/preview`,
      { responseType: "arraybuffer", params },
    );
    return response.data;
  }, []);

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
    fetchAssetBlobUrl,
    fetchAssetArrayBuffer,
  };
}

export function useAdminEBookletPurchases() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12 });
  const [status, setStatus] = useState("all");

  const fetchPurchases = useCallback(
    async (overrides = {}) => {
      const query = new URLSearchParams();
      query.set("page", String(overrides.page ?? pagination.page));
      query.set("limit", String(overrides.limit ?? pagination.limit));
      const nextStatus = overrides.status ?? status;
      if (nextStatus && nextStatus !== "all") query.set("status", nextStatus);

      const response = await fetchApi(
        {
          endpoint: `/admin/e-booklet-purchases?${query.toString()}`,
          method: "get",
        },
        false,
      );
      const normalized = normalizeListResponse(response);
      setPurchases(normalized.data);
      setPagination((current) => ({
        ...current,
        total: normalized.total,
        page: normalized.page,
        limit: normalized.limit,
      }));
      return response;
    },
    [fetchApi, pagination.limit, pagination.page, status],
  );

  const setPage = useCallback((page) => {
    setPagination((current) => ({ ...current, page }));
  }, []);

  const changeStatusFilter = useCallback((value) => {
    setStatus(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const fetchPurchase = useCallback(
    (purchaseId) =>
      fetchApi(
        {
          endpoint: `/admin/e-booklet-purchases/${purchaseId}`,
          method: "get",
        },
        false,
      ),
    [fetchApi],
  );

  const updatePurchaseStatus = useCallback(
    (purchaseId, nextStatus, adminNotes) =>
      fetchApi({
        endpoint: `/admin/e-booklet-purchases/${purchaseId}/status`,
        method: "patch",
        data: { status: nextStatus, admin_notes: adminNotes },
        defaultSuccessMessage: i18n.t("eBooklets:toasts.purchaseUpdated"),
      }),
    [fetchApi],
  );

  const markPaid = useCallback(
    (purchaseId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-purchases/${purchaseId}/mark-paid`,
        method: "post",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.purchaseMarkedPaid"),
      }),
    [fetchApi],
  );

  const deliverPurchase = useCallback(
    (purchaseId, data) =>
      fetchApi({
        endpoint: `/admin/e-booklet-purchases/${purchaseId}/deliver`,
        method: "post",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.delivered"),
      }),
    [fetchApi],
  );

  const approveStudentPurchase = useCallback(
    (purchaseId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-student-purchases/${purchaseId}/approve`,
        method: "post",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.studentPurchaseApproved"),
      }),
    [fetchApi],
  );

  const prepareCustomTemplate = useCallback(
    (purchaseId) =>
      fetchApi({
        endpoint: `/admin/e-booklet-purchases/${purchaseId}/custom-template`,
        method: "post",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.teacherTemplateReady", {
          defaultValue: "Teacher-specific eBooklet template is ready to edit.",
        }),
      }),
    [fetchApi],
  );

  const uploadTeacherDocument = useCallback(
    (file, data = {}) => {
      const formData = new FormData();
      formData.append("document", file);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      return fetchApi({
        endpoint: "/admin/e-booklet-files/document",
        method: "post",
        data: formData,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.teacherDocumentStored"),
      });
    },
    [fetchApi],
  );

  return {
    purchases,
    pagination,
    status,
    loading,
    setPage,
    setStatus: changeStatusFilter,
    fetchPurchases,
    fetchPurchase,
    updatePurchaseStatus,
    markPaid,
    deliverPurchase,
    approveStudentPurchase,
    prepareCustomTemplate,
    uploadTeacherDocument,
  };
}


export function useAdminEBookletInstances() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [instances, setInstances] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  const [status, setStatusState] = useState("all");

  const fetchInstances = useCallback(async (overrides = {}) => {
    const query = new URLSearchParams();
    query.set("page", String(overrides.page ?? pagination.page));
    query.set("limit", String(overrides.limit ?? pagination.limit));
    const nextStatus = overrides.status ?? status;
    if (nextStatus && nextStatus !== "all") query.set("status", nextStatus);
    if (overrides.teacher_id) query.set("teacher_id", String(overrides.teacher_id));
    const response = await fetchApi({ endpoint: `/admin/e-booklet-instances?${query.toString()}`, method: "get" }, false);
    const normalized = normalizeListResponse(response);
    setInstances(normalized.data);
    setPagination((current) => ({ ...current, total: normalized.total, page: normalized.page, limit: normalized.limit }));
    return response;
  }, [fetchApi, pagination.limit, pagination.page, status]);

  const setPage = useCallback((page) => setPagination((current) => ({ ...current, page })), []);
  const setStatus = useCallback((value) => { setStatusState(value); setPagination((current) => ({ ...current, page: 1 })); }, []);
  const updateQuota = useCallback((instanceId, invite_quota) => fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/update-quota`, method: "post", data: { invite_quota }, defaultSuccessMessage: i18n.t("eBooklets:toasts.quotaUpdated") }), [fetchApi]);
  const revokeTeacherAccess = useCallback((instanceId) => fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/revoke-access`, method: "post", defaultSuccessMessage: i18n.t("eBooklets:toasts.teacherAccessRevoked") }), [fetchApi]);
  const listAccessCodes = useCallback((filters = {}) => {
    const query = new URLSearchParams();
    if (filters.bookletInstanceId) query.set("bookletInstanceId", String(filters.bookletInstanceId));
    if (filters.teacherId) query.set("teacherId", String(filters.teacherId));
    if (filters.kind && filters.kind !== "all") query.set("kind", filters.kind);
    if (filters.status && filters.status !== "all") query.set("status", filters.status);
    return fetchApi({ endpoint: `/admin/e-booklet-access-codes?${query.toString()}`, method: "get" }, false);
  }, [fetchApi]);
  const generateAccessCodes = useCallback((data) => fetchApi({ endpoint: "/admin/e-booklet-access-codes/bulk", method: "post", data, defaultSuccessMessage: i18n.t("eBooklets:toasts.accessCodesGenerated") }), [fetchApi]);

  return { instances, pagination, status, loading, fetchInstances, setPage, setStatus, updateQuota, revokeTeacherAccess, listAccessCodes, generateAccessCodes };
}

export function useAdminEBookletTermsMilestones() {
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [terms, setTerms] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [progress, setProgress] = useState({ paidRedemptions: 0, achievements: [] });
  const [actionLoading, setActionLoading] = useState(false);

  const runAction = useCallback(async (action) => {
    setActionLoading(true);
    try {
      return await action();
    } finally {
      setActionLoading(false);
    }
  }, []);

  const fetchTerms = useCallback(async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== "all") query.set("status", filters.status);
    if (filters.templateId !== undefined) query.set("template_id", filters.templateId === null ? "null" : String(filters.templateId));
    const response = await fetchApi({ endpoint: `/admin/e-booklet-terms${query.toString() ? `?${query.toString()}` : ""}`, method: "get" }, false);
    setTerms(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const fetchMilestones = useCallback(async (termId) => {
    const query = termId ? `?term_id=${termId}` : "";
    const response = await fetchApi({ endpoint: `/admin/e-booklet-milestones${query}`, method: "get" }, false);
    setMilestones(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const fetchProgress = useCallback(async (termId) => {
    const query = termId ? `?term_id=${termId}` : "";
    const response = await fetchApi({ endpoint: `/admin/e-booklet-progress${query}`, method: "get" }, false);
    setProgress(response?.data || { paidRedemptions: 0, achievements: [] });
    return response;
  }, [fetchApi]);

  const createTerm = useCallback((data) => runAction(() => fetchApi({ endpoint: "/admin/e-booklet-terms", method: "post", data, defaultSuccessMessage: i18n.t("eBooklets:toasts.termSaved") })), [fetchApi, runAction]);
  const updateTerm = useCallback((termId, data) => runAction(() => fetchApi({ endpoint: `/admin/e-booklet-terms/${termId}`, method: "patch", data, defaultSuccessMessage: i18n.t("eBooklets:toasts.termSaved") })), [fetchApi, runAction]);
  const activateTerm = useCallback((termId) => runAction(() => fetchApi({ endpoint: `/admin/e-booklet-terms/${termId}/activate`, method: "post", defaultSuccessMessage: i18n.t("eBooklets:toasts.termActivated") })), [fetchApi, runAction]);
  const createMilestone = useCallback((data) => runAction(() => fetchApi({ endpoint: "/admin/e-booklet-milestones", method: "post", data, defaultSuccessMessage: i18n.t("eBooklets:toasts.milestoneSaved") })), [fetchApi, runAction]);
  const updateMilestone = useCallback((milestoneId, data) => runAction(() => fetchApi({ endpoint: `/admin/e-booklet-milestones/${milestoneId}`, method: "patch", data, defaultSuccessMessage: i18n.t("eBooklets:toasts.milestoneSaved") })), [fetchApi, runAction]);
  const deleteMilestone = useCallback((milestoneId) => runAction(() => fetchApi({ endpoint: `/admin/e-booklet-milestones/${milestoneId}`, method: "delete", defaultSuccessMessage: i18n.t("eBooklets:toasts.milestoneDeleted") })), [fetchApi, runAction]);
  const reorderMilestones = useCallback((termId, items) => runAction(() => fetchApi({ endpoint: "/admin/e-booklet-milestones/reorder", method: "post", data: { termId, items }, defaultSuccessMessage: i18n.t("eBooklets:toasts.milestonesReordered") })), [fetchApi, runAction]);

  return {
    terms,
    milestones,
    progress,
    loading: apiLoading,
    actionLoading,
    fetchTerms,
    fetchMilestones,
    fetchProgress,
    createTerm,
    updateTerm,
    activateTerm,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
  };
}

export function useAdminEBookletDevices() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [devices, setDevices] = useState([]);
  const [students, setStudents] = useState([]);

  const fetchDevices = useCallback(async (instanceId, userId) => {
    if (!instanceId || !userId) { setDevices([]); return { data: [] }; }
    const response = await fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/users/${userId}/devices`, method: "get" }, false);
    setDevices(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const fetchStudents = useCallback(async (instanceId) => {
    if (!instanceId) { setStudents([]); return { data: [] }; }
    const response = await fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/students`, method: "get" }, false);
    setStudents(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const resetDevices = useCallback((instanceId, userId, reason) => fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/users/${userId}/devices/reset`, method: "post", data: { reason }, defaultSuccessMessage: i18n.t("eBooklets:toasts.devicesReset") }), [fetchApi]);
  const addDeviceAllowance = useCallback((instanceId, userId, allowedDevices, reason) => fetchApi({ endpoint: `/admin/e-booklet-instances/${instanceId}/users/${userId}/device-allowance`, method: "post", data: { allowedDevices: Number(allowedDevices), reason }, defaultSuccessMessage: i18n.t("eBooklets:toasts.deviceAllowanceUpdated") }), [fetchApi]);

  const setDiscoveredStudents = useCallback((rows = []) => {
    setStudents(Array.isArray(rows) ? rows : []);
  }, []);

  return { devices, students, loading, fetchDevices, fetchStudents, resetDevices, addDeviceAllowance, setDiscoveredStudents };
}
