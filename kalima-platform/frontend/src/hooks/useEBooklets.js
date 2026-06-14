import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "@/i18n";
import useApiMutation from "./useApiMutation";

const E_BOOKLET_CART_KEY = "kalima:e-booklet-cart:v1";

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getActiveVersion = (template) => {
  if (!template) return null;
  if (template.active_version) return template.active_version;
  if (template.template_version) return template.template_version;
  if (Array.isArray(template.versions) && template.versions.length > 0) {
    return template.versions[0];
  }
  return null;
};

const getHotspotCount = (template, version) => {
  return (
    template?.hotspot_count ??
    version?._count?.hotspots ??
    template?._count?.hotspots ??
    0
  );
};

const getInstanceTemplate = (instance) => instance?.template || instance;

const getInstanceVersion = (instance, template) =>
  instance?.template_version || template?.active_version || template?.template_version;

export const normalizeEBookletTemplate = (template) => {
  const sourceTemplate = getInstanceTemplate(template);
  const activeVersion = getInstanceVersion(template, sourceTemplate) || getActiveVersion(sourceTemplate);

  return {
    ...template,
    template: sourceTemplate,
    instanceId: template?.id,
    template_id: template?.template_id || sourceTemplate?.id,
    template_version_id: template?.template_version_id || activeVersion?.id,
    activeVersion,
    coverUrl:
      sourceTemplate?.cover_url ||
      sourceTemplate?.cover_file?.url ||
      sourceTemplate?.cover_file?.storage_url ||
      null,
    categoryTitle:
      sourceTemplate?.category?.title ||
      sourceTemplate?.category_title ||
      null,
    pageCount: parseNumber(
      sourceTemplate?.page_count ?? activeVersion?.page_count,
      0,
    ),
    hotspotCount: parseNumber(getHotspotCount(sourceTemplate, activeVersion), 0),
    price: parseNumber(template?.student_marketing_price ?? template?.price, 0),
    currency: template?.currency || sourceTemplate?.currency || "EGP",
    title: sourceTemplate?.title || template?.title,
    slug: sourceTemplate?.slug || template?.slug || String(template?.id || ""),
    description: sourceTemplate?.description || template?.description,
    teacherName: template?.teacher?.name || template?.teacher?.full_name || template?.teacher_name || null,
    seatsRemaining: template?.seats_remaining ?? template?.remaining_seats,
    studentLimit: template?.student_limit,
    accessExpiresAt: template?.access_expires_at,
  };
};

const readCart = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(E_BOOKLET_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(E_BOOKLET_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("e-booklet-cart-change"));
};

export const buildEBookletCartItem = (template) => {
  const normalized = normalizeEBookletTemplate(template);

  return {
    id: normalized.instanceId,
    instance_id: normalized.instanceId,
    template_id: normalized.template_id,
    template_version_id: normalized.template_version_id || normalized.activeVersion?.id,
    slug: normalized.slug,
    title: normalized.title,
    description: normalized.description,
    price: normalized.price,
    currency: normalized.currency,
    coverUrl: normalized.coverUrl,
    pageCount: normalized.pageCount,
    hotspotCount: normalized.hotspotCount,
  };
};

export function useEBookletCart() {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener("storage", sync);
    window.addEventListener("e-booklet-cart-change", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("e-booklet-cart-change", sync);
    };
  }, []);

  const replaceWithTemplate = useCallback((template) => {
    const item = buildEBookletCartItem(template);
    writeCart([item]);
    setItems([item]);
    return item;
  }, []);

  const removeItem = useCallback((templateId) => {
    const nextItems = readCart().filter(
      (item) => String(item.template_id) !== String(templateId),
    );
    writeCart(nextItems);
    setItems(nextItems);
  }, []);

  const clear = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + parseNumber(item.price, 0), 0),
    [items],
  );

  return {
    items,
    item: items[0] || null,
    total,
    currency: items[0]?.currency || "EGP",
    replaceWithTemplate,
    removeItem,
    clear,
  };
}

export function useEBookletStore(initialParams = {}) {
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({
    search: initialParams.search || "",
    category_id: initialParams.category_id || null,
  });
  const [pagination, setPagination] = useState({
    page: initialParams.page ?? 1,
    limit: initialParams.limit ?? 12,
    total: 0,
  });
  const [initLoading, setInitLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    const query = new URLSearchParams();
    query.set("page", String(pagination.page));
    query.set("limit", String(pagination.limit));
    if (filters.search) query.set("search", filters.search);
    if (filters.category_id) query.set("category_id", filters.category_id);

    try {
      const response = await fetchApi({
        endpoint: `/e-booklet-store?${query.toString()}`,
        method: "get",
      }, false);

      setTemplates(
        Array.isArray(response?.data)
          ? response.data.map(normalizeEBookletTemplate)
          : [],
      );
      setPagination((current) => ({
        ...current,
        total: response?.total ?? 0,
        page: response?.page ?? current.page,
        limit: response?.limit ?? current.limit,
      }));
    } catch (error) {
      console.error("Failed to fetch e-booklet templates:", error);
      setTemplates([]);
    } finally {
      setInitLoading(false);
    }
  }, [
    fetchApi,
    filters.category_id,
    filters.search,
    pagination.limit,
    pagination.page,
  ]);

  useEffect(() => {
    setInitLoading(true);
    fetchTemplates();
  }, [fetchTemplates]);

  const setSearch = useCallback((search) => {
    setFilters((current) => ({ ...current, search }));
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const setCategory = useCallback((categoryId) => {
    setFilters((current) => ({ ...current, category_id: categoryId }));
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setPagination((current) => ({ ...current, page }));
  }, []);

  return {
    templates,
    filters,
    pagination,
    setSearch,
    setCategory,
    setPage,
    refresh: fetchTemplates,
    loading: apiLoading || initLoading,
  };
}

export function useEBookletTemplate(instanceId) {
  const { mutate: fetchApi, loading: apiLoading } = useApiMutation();
  const [template, setTemplate] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [initLoading, setInitLoading] = useState(Boolean(instanceId));

  useEffect(() => {
    if (!instanceId) return undefined;
    let active = true;

    const fetchTemplate = async () => {
      setInitLoading(true);
      setNotFound(false);

      try {
        const response = await fetchApi({
          endpoint: `/e-booklet-store/instances/${instanceId}`,
          method: "get",
        }, false);

        if (!active) return;
        if (response?.success && response?.data) {
          setTemplate(normalizeEBookletTemplate(response.data));
        } else {
          setTemplate(null);
          setNotFound(true);
        }
      } catch (error) {
        if (!active) return;
        console.error(`Failed to fetch e-booklet instance ${instanceId}:`, error);
        setTemplate(null);
        setNotFound(true);
      } finally {
        if (active) setInitLoading(false);
      }
    };

    fetchTemplate();
    return () => {
      active = false;
    };
  }, [fetchApi, instanceId]);

  return {
    template,
    notFound,
    loading: apiLoading || initLoading,
  };
}

export function useEBookletCheckout() {
  const { mutate, loading, error } = useApiMutation();

  const submitCheckout = useCallback(
    async (payload) => {
      return mutate({
        endpoint: "/e-booklet-checkout",
        method: "post",
        data: payload,
        defaultSuccessMessage: i18n.t("eBooklets:toasts.requestSubmitted"),
      });
    },
    [mutate],
  );

  return {
    submitCheckout,
    loading,
    error,
  };
}
