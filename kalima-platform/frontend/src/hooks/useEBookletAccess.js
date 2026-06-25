import { useCallback, useRef, useState } from "react";
import i18n from "@/i18n";
import api from "@/api/axios";
import useApiMutation from "./useApiMutation";
import { buildHotspotAssetEndpoint, buildHotspotContentEndpoint } from "@/utils/eBookletViewerEndpoints";

export function useTeacherEBooklets() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [items, setItems] = useState([]);
  const [invites, setInvites] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [students, setStudents] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [walletLedger, setWalletLedger] = useState([]);
  const [walletRewardLots, setWalletRewardLots] = useState([]);
  const [currentTerms, setCurrentTerms] = useState(null);

  const fetchTeacherEBooklets = useCallback(async () => {
    const response = await fetchApi(
      { endpoint: "/teacher/e-booklets", method: "get" },
      false,
    );
    setItems(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const fetchInvites = useCallback(
    async (instanceId) => {
      const response = await fetchApi(
        {
          endpoint: `/teacher/e-booklets/${instanceId}/invites`,
          method: "get",
        },
        false,
      );
      setInvites(Array.isArray(response?.data) ? response.data : []);
      return response;
    },
    [fetchApi],
  );

  const createInvite = useCallback(
    (instanceId, data) =>
      fetchApi({
        endpoint: `/teacher/e-booklets/${instanceId}/invites`,
        method: "post",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.inviteCreated"),
      }),
    [fetchApi],
  );

  const disableInvite = useCallback(
    (inviteId) =>
      fetchApi({
        endpoint: `/teacher/e-booklet-invites/${inviteId}/disable`,
        method: "patch",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.inviteDisabled"),
      }),
    [fetchApi],
  );

  const fetchStudents = useCallback(
    async (instanceId) => {
      const response = await fetchApi(
        {
          endpoint: `/teacher/e-booklets/${instanceId}/students`,
          method: "get",
        },
        false,
      );
      setStudents(Array.isArray(response?.data) ? response.data : []);
      return response;
    },
    [fetchApi],
  );

  const revokeStudent = useCallback(
    (instanceId, studentId) =>
      fetchApi({
        endpoint: `/teacher/e-booklets/${instanceId}/students/${studentId}/revoke`,
        method: "patch",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.studentRevoked"),
      }),
    [fetchApi],
  );

  const fetchCurrentTerms = useCallback(async (templateId) => {
    const suffix = templateId ? `?template_id=${encodeURIComponent(templateId)}` : "";
    const response = await fetchApi(
      { endpoint: `/teacher/e-booklet-terms/current${suffix}`, method: "get" },
      false,
    );
    setCurrentTerms(response?.data || null);
    return response;
  }, [fetchApi]);

  const acceptCodeGenerationTerms = useCallback(
    (templateId) => fetchApi({
      endpoint: "/teacher/e-booklet-terms/accept-code-generation",
      method: "post",
      data: templateId ? { templateId } : {},
      defaultSuccessMessage: i18n.t("eBooklets:toasts.termsAccepted"),
    }),
    [fetchApi],
  );

  const createAccessCode = useCallback(
    (instanceId, data) => fetchApi({
      endpoint: `/teacher/e-booklets/${instanceId}/access-codes`,
      method: "post",
      data,
      defaultSuccessMessage: i18n.t("eBooklets:toasts.accessCodeCreated"),
    }),
    [fetchApi],
  );

  const fetchAccessCodes = useCallback(async (instanceId, filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.kind) query.set("kind", filters.kind);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await fetchApi(
      { endpoint: `/teacher/e-booklets/${instanceId}/access-codes${suffix}`, method: "get" },
      false,
    );
    setAccessCodes(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const createAccessCodes = useCallback(
    (instanceId, data) => fetchApi({
      endpoint: `/teacher/e-booklets/${instanceId}/access-codes/bulk`,
      method: "post",
      data,
      defaultSuccessMessage: i18n.t("eBooklets:toasts.accessCodeCreated"),
    }),
    [fetchApi],
  );

  const fetchTeacherMilestones = useCallback(async (termId) => {
    const suffix = termId ? `?term_id=${encodeURIComponent(termId)}` : "";
    const response = await fetchApi(
      { endpoint: `/teacher/e-booklet-milestones${suffix}`, method: "get" },
      false,
    );
    setMilestones(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const evaluateTeacherMilestones = useCallback(
    (termId) => fetchApi(
      { endpoint: "/teacher/e-booklet-milestones/evaluate", method: "post", data: termId ? { termId } : {} },
      false,
    ),
    [fetchApi],
  );

  const fetchTeacherWallet = useCallback(async () => {
    const response = await fetchApi(
      { endpoint: "/teacher/e-booklet-wallet", method: "get" },
      false,
    );
    setWallet(response?.data?.wallet || null);
    setWalletLedger(Array.isArray(response?.data?.ledger) ? response.data.ledger : []);
    setWalletRewardLots(Array.isArray(response?.data?.rewardLots) ? response.data.rewardLots : []);
    return response;
  }, [fetchApi]);

  const claimMilestoneReward = useCallback(
    (achievementId) => fetchApi({
      endpoint: `/teacher/e-booklet-milestone-achievements/${achievementId}/claim`,
      method: "post",
      data: { termsAccepted: true },
      defaultSuccessMessage: i18n.t("eBooklets:toasts.rewardClaimed"),
    }),
    [fetchApi],
  );

  return {
    items,
    invites,
    accessCodes,
    students,
    milestones,
    wallet,
    walletLedger,
    walletRewardLots,
    currentTerms,
    loading,
    fetchTeacherEBooklets,
    fetchInvites,
    createInvite,
    disableInvite,
    fetchStudents,
    revokeStudent,
    fetchCurrentTerms,
    acceptCodeGenerationTerms,
    createAccessCode,
    createAccessCodes,
    fetchAccessCodes,
    fetchTeacherMilestones,
    evaluateTeacherMilestones,
    fetchTeacherWallet,
    claimMilestoneReward,
  };
}

const ANALYTICS_QUERY_KEYS = {
  startDate: "start_date",
  endDate: "end_date",
  teacherId: "teacher_id",
  instanceId: "instance_id",
  studentId: "student_id",
  source: "source",
};

const buildAnalyticsQueryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(ANALYTICS_QUERY_KEYS[key] || key, String(value));
    }
  });
  return query.toString();
};

export function useTeacherEBookletAnalytics() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [analytics, setAnalytics] = useState({ events: {}, revenue: {} });

  const fetchAnalytics = useCallback(async (filters = {}) => {
    const query = buildAnalyticsQueryString(filters);
    const suffix = query ? `?${query}` : "";
    const response = await fetchApi(
      { endpoint: `/teacher/e-booklet-analytics${suffix}`, method: "get" },
      false,
    );
    setAnalytics(response?.data || { events: {}, revenue: {} });
    return response;
  }, [fetchApi]);

  const exportCsv = useCallback(async (filters = {}) => {
    const query = buildAnalyticsQueryString(filters);
    const response = await api.get(
      `/teacher/e-booklet-analytics.csv${query ? `?${query}` : ""}`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher-e-booklet-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return response;
  }, []);

  return { analytics, loading, fetchAnalytics, exportCsv };
}

export function useEBookletViewer({ adminMode = false, previewMode = false } = {}) {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [metadata, setMetadata] = useState(null);
  const [metadataError, setMetadataError] = useState("");
  const [page, setPage] = useState(null);
  const [pageError, setPageError] = useState("");
  const [hotspots, setHotspots] = useState([]);
  const metadataRequestRef = useRef(0);
  const pageRequestRef = useRef(0);
  const viewerBase = adminMode ? "/admin/e-booklet-viewer" : "/e-booklet-viewer";

  const fetchMetadata = useCallback(
    async (instanceId, fallbackMessage) => {
      const requestId = metadataRequestRef.current + 1;
      metadataRequestRef.current = requestId;
      setMetadataError("");
      try {
        const response = await fetchApi(
          {
            endpoint: previewMode
              ? `/e-booklet-store/${instanceId}/preview/metadata`
              : `${viewerBase}/${instanceId}/metadata`,
            method: "get",
          },
          false,
        );
        if (metadataRequestRef.current === requestId) {
          setMetadata(response?.data || null);
        }
        return response;
      } catch (error) {
        if (metadataRequestRef.current === requestId) {
          setMetadata(null);
          setMetadataError(error?.response?.data?.message || error?.message || fallbackMessage || "");
        }
        throw error;
      }
    },
    [fetchApi, previewMode, viewerBase],
  );

  const fetchPage = useCallback(
    async (instanceId, pageNumber, fallbackMessage) => {
      const requestId = pageRequestRef.current + 1;
      pageRequestRef.current = requestId;
      setPageError("");
      try {
        const [pageResponse, hotspotsResponse] = await Promise.all([
          fetchApi(
            {
              endpoint: previewMode
                ? `/e-booklet-store/${instanceId}/preview/pages/${pageNumber}`
                : `${viewerBase}/${instanceId}/pages/${pageNumber}`,
              method: "get",
            },
            false,
          ),
          fetchApi(
            {
              endpoint: previewMode
                ? `/e-booklet-store/${instanceId}/preview/pages/${pageNumber}/hotspots`
                : `${viewerBase}/${instanceId}/pages/${pageNumber}/hotspots`,
              method: "get",
            },
            false,
          ),
        ]);
        if (pageRequestRef.current === requestId) {
          setPage(pageResponse?.data || null);
          setHotspots(Array.isArray(hotspotsResponse?.data) ? hotspotsResponse.data : []);
        }
        return { page: pageResponse?.data, hotspots: hotspotsResponse?.data };
      } catch (error) {
        if (pageRequestRef.current === requestId) {
          setPage(null);
          setHotspots([]);
          setPageError(error?.response?.data?.message || error?.message || fallbackMessage || "");
        }
        throw error;
      }
    },
    [fetchApi, previewMode, viewerBase],
  );

  const fetchHotspotContent = useCallback(
    (hotspotId, instanceId) => {
      const endpoint = previewMode
        ? `/e-booklet-store/${instanceId}/preview/hotspots/${hotspotId}/content`
        : buildHotspotContentEndpoint({ adminMode, viewerBase, instanceId, hotspotId });
      return fetchApi(
        {
          endpoint,
          method: "get",
        },
        false,
      );
    },
    [adminMode, fetchApi, previewMode, viewerBase],
  );

  const bindDevice = useCallback(
    (instanceId, data) =>
      fetchApi(
        {
          endpoint: `/e-booklet-viewer/${instanceId}/devices/bind`,
          method: "post",
          data,
        },
        false,
      ),
    [fetchApi],
  );

  const fetchViewerDocumentPageData = useCallback(async (instanceId, pageNumber, pageAccessToken, signal) => {
    if (previewMode) {
      throw new Error(i18n.t("eBooklets:viewer.documentUnavailable"));
    }
    const response = await api.get(
      `${viewerBase}/${instanceId}/document`,
      {
        responseType: "arraybuffer",
        params: { page: pageNumber },
        headers: { "X-E-Booklet-Page-Token": pageAccessToken },
        signal,
        suppressErrorToast: true,
      },
    );
    return response.data;
  }, [previewMode, viewerBase]);

  const fetchViewerDocumentPagePreviewBlobUrl = useCallback(async (instanceId, pageNumber, pageAccessToken, signal) => {
    const response = await api.get(
      previewMode
        ? `/e-booklet-store/${instanceId}/preview/pages/${pageNumber}/preview`
        : `${viewerBase}/${instanceId}/pages/${pageNumber}/preview`,
      {
        responseType: "blob",
        headers: previewMode ? undefined : { "X-E-Booklet-Page-Token": pageAccessToken },
        signal,
        suppressErrorToast: true,
      },
    );
    return URL.createObjectURL(response.data);
  }, [previewMode, viewerBase]);

  const fetchHotspotAssetBlobUrl = useCallback(async (hotspotId, assetId, instanceId) => {
    const endpoint = previewMode
      ? `/e-booklet-store/${instanceId}/preview/hotspots/${hotspotId}/assets/${assetId}`
      : buildHotspotAssetEndpoint({ adminMode, viewerBase, instanceId, hotspotId, assetId });
    const response = await api.get(
      endpoint,
      { responseType: "blob" },
    );
    return URL.createObjectURL(response.data);
  }, [adminMode, previewMode, viewerBase]);

  return {
    metadata,
    metadataError,
    page,
    pageError,
    hotspots,
    loading,
    fetchMetadata,
    fetchPage,
    fetchHotspotContent,
    bindDevice,
    fetchViewerDocumentPageData,
    fetchViewerDocumentPagePreviewBlobUrl,
    fetchHotspotAssetBlobUrl,
  };
}

export function useStudentEBooklets() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [items, setItems] = useState([]);

  const fetchStudentEBooklets = useCallback(async () => {
    const response = await fetchApi(
      { endpoint: "/student/e-booklets", method: "get" },
      false,
    );
    setItems(Array.isArray(response?.data) ? response.data : []);
    return response;
  }, [fetchApi]);

  const openInvite = useCallback(
    (token) => fetchApi(
      {
        endpoint: `/e-booklet-invites/${token}/open`,
        method: "get",
      },
      false,
    ),
    [fetchApi],
  );

  const acceptInvite = useCallback(
    (token, data = {}) =>
      fetchApi({
        endpoint: `/e-booklet-invites/${token}/accept`,
        method: "post",
        data,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.accessGranted"),
      }),
    [fetchApi],
  );

  const redeemAccessCode = useCallback(
    (code, termsVersion) =>
      fetchApi({
        endpoint: "/e-booklet-access-codes/redeem",
        method: "post",
        data: {
          code,
          termsAccepted: true,
          termsVersion,
        },
        defaultSuccessMessage: i18n.t("eBooklets:toasts.accessGranted"),
      }),
    [fetchApi],
  );

  return {
    items,
    loading,
    fetchStudentEBooklets,
    openInvite,
    acceptInvite,
    redeemAccessCode,
  };
}
