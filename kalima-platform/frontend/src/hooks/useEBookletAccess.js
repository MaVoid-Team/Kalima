import { useCallback, useState } from "react";
import i18n from "@/i18n";
import api from "@/api/axios";
import useApiMutation from "./useApiMutation";

export function useTeacherEBooklets() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [items, setItems] = useState([]);
  const [invites, setInvites] = useState([]);
  const [students, setStudents] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [walletLedger, setWalletLedger] = useState([]);
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
    students,
    milestones,
    wallet,
    walletLedger,
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

  return { analytics, loading, fetchAnalytics };
}

export function useEBookletViewer({ adminMode = false } = {}) {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [metadata, setMetadata] = useState(null);
  const [page, setPage] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const viewerBase = adminMode ? "/admin/e-booklet-viewer" : "/e-booklet-viewer";

  const fetchMetadata = useCallback(
    async (instanceId) => {
      const response = await fetchApi(
        {
          endpoint: `${viewerBase}/${instanceId}/metadata`,
          method: "get",
        },
        false,
      );
      setMetadata(response?.data || null);
      return response;
    },
    [fetchApi, viewerBase],
  );

  const fetchPage = useCallback(
    async (instanceId, pageNumber) => {
      const [pageResponse, hotspotsResponse] = await Promise.all([
        fetchApi(
          {
            endpoint: `${viewerBase}/${instanceId}/pages/${pageNumber}`,
            method: "get",
          },
          false,
        ),
        fetchApi(
          {
            endpoint: `${viewerBase}/${instanceId}/pages/${pageNumber}/hotspots`,
            method: "get",
          },
          false,
        ),
      ]);
      setPage(pageResponse?.data || null);
      setHotspots(Array.isArray(hotspotsResponse?.data) ? hotspotsResponse.data : []);
      return { page: pageResponse?.data, hotspots: hotspotsResponse?.data };
    },
    [fetchApi, viewerBase],
  );

  const fetchHotspotContent = useCallback(
    (hotspotId) =>
      fetchApi(
        {
          endpoint: `${viewerBase}/hotspots/${hotspotId}/content`,
          method: "get",
        },
        false,
      ),
    [fetchApi, viewerBase],
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

  const fetchHotspotAssetBlobUrl = useCallback(async (hotspotId, assetId) => {
    const response = await api.get(
      `${viewerBase}/hotspots/${hotspotId}/assets/${assetId}`,
      { responseType: "blob" },
    );
    return URL.createObjectURL(response.data);
  }, [viewerBase]);

  return {
    metadata,
    page,
    hotspots,
    loading,
    fetchMetadata,
    fetchPage,
    fetchHotspotContent,
    bindDevice,
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
