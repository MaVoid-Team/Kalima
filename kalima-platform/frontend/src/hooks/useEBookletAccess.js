import { useCallback, useState } from "react";
import i18n from "@/i18n";
import useApiMutation from "./useApiMutation";

export function useTeacherEBooklets() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [items, setItems] = useState([]);
  const [invites, setInvites] = useState([]);
  const [students, setStudents] = useState([]);

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

  return {
    items,
    invites,
    students,
    loading,
    fetchTeacherEBooklets,
    fetchInvites,
    createInvite,
    disableInvite,
    fetchStudents,
    revokeStudent,
  };
}

export function useEBookletViewer() {
  const { mutate: fetchApi, loading } = useApiMutation();
  const [metadata, setMetadata] = useState(null);
  const [page, setPage] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  const fetchMetadata = useCallback(
    async (instanceId) => {
      const response = await fetchApi(
        {
          endpoint: `/e-booklet-viewer/${instanceId}/metadata`,
          method: "get",
        },
        false,
      );
      setMetadata(response?.data || null);
      return response;
    },
    [fetchApi],
  );

  const fetchPage = useCallback(
    async (instanceId, pageNumber) => {
      const [pageResponse, hotspotsResponse] = await Promise.all([
        fetchApi(
          {
            endpoint: `/e-booklet-viewer/${instanceId}/pages/${pageNumber}`,
            method: "get",
          },
          false,
        ),
        fetchApi(
          {
            endpoint: `/e-booklet-viewer/${instanceId}/pages/${pageNumber}/hotspots`,
            method: "get",
          },
          false,
        ),
      ]);
      setPage(pageResponse?.data || null);
      setHotspots(Array.isArray(hotspotsResponse?.data) ? hotspotsResponse.data : []);
      return { page: pageResponse?.data, hotspots: hotspotsResponse?.data };
    },
    [fetchApi],
  );

  const fetchHotspotContent = useCallback(
    (hotspotId) =>
      fetchApi(
        {
          endpoint: `/e-booklet-viewer/hotspots/${hotspotId}/content`,
          method: "get",
        },
        false,
      ),
    [fetchApi],
  );

  return {
    metadata,
    page,
    hotspots,
    loading,
    fetchMetadata,
    fetchPage,
    fetchHotspotContent,
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

  const acceptInvite = useCallback(
    (token) =>
      fetchApi({
        endpoint: `/e-booklet-invites/${token}/accept`,
        method: "post",
        defaultSuccessMessage: i18n.t("eBooklets:toasts.accessGranted"),
      }),
    [fetchApi],
  );

  return {
    items,
    loading,
    fetchStudentEBooklets,
    acceptInvite,
  };
}
