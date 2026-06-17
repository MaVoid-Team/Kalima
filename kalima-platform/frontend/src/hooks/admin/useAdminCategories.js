import { useCallback, useState } from "react";
import useApiMutation from "../useApiMutation";


const getId = (doc) => String(doc?.id ?? doc?.parent_id ?? doc ?? "");

const findCategory = (id, categories, childrenMap) => {
  const targetId = String(id);
  const inRoots = categories.find((c) => getId(c) === targetId);
  if (inRoots) return inRoots;

  for (const list of Object.values(childrenMap)) {
    const found = list.find((c) => getId(c) === targetId);
    if (found) return found;
  }
  return null;
};

const removeCategory = (id, state, removeChildren = true) => {
  const targetId = String(id);
  const childrenMap = { ...state.childrenMap };

  // Remove from all potential child lists
  Object.keys(childrenMap).forEach((pid) => {
    childrenMap[pid] = childrenMap[pid].filter((c) => getId(c) !== targetId);
  });

  if (removeChildren) delete childrenMap[targetId];

  return {
    ...state,
    categories: state.categories.filter((c) => getId(c) !== targetId),
    childrenMap,
  };
};

const insertCategory = (category, state) => {
  const pid = getId(category.parent || category.parent_id);
  const isRoot = !pid || pid === "null" || pid === "0";

  if (isRoot) {
    const exists = state.categories.some((c) => getId(c) === getId(category));
    return {
      ...state,
      categories: exists ? state.categories : [category, ...state.categories],
    };
  }

  const currentList = state.childrenMap[pid] || [];
  const exists = currentList.some((c) => getId(c) === getId(category));

  return {
    ...state,
    childrenMap: {
      ...state.childrenMap,
      [pid]: exists ? currentList : [...currentList, category],
    },
  };
};

const updateCategory = (id, updates, state) => {
  const oldDoc = findCategory(id, state.categories, state.childrenMap);
  if (!oldDoc) return state;

  const oldPid = getId(oldDoc.parent || oldDoc.parent_id);
  const newPid = getId(updates.parent || updates.parent_id);
  const hasParentInfo = "parent" in updates || "parent_id" in updates;
  const isMoving = hasParentInfo && oldPid !== newPid;

  const merged = {
    ...oldDoc,
    ...updates,
    ...(isMoving && !updates.parent ? { parent: null } : {}),
  };

  if (isMoving) {
    const cleaned = removeCategory(id, state, false);
    return insertCategory(merged, cleaned);
  }

  // Update in-place
  const targetId = String(id);
  const mapper = (c) => (getId(c) === targetId ? merged : c);

  return {
    ...state,
    categories: state.categories.map(mapper),
    childrenMap: Object.fromEntries(
      Object.entries(state.childrenMap).map(([pid, list]) => [
        pid,
        list.map(mapper),
      ]),
    ),
  };
};

/**
 * HOOK
 */
export default function useAdminCategories() {
  const { mutate: apiMutate, loading: apiLoading } = useApiMutation();
  const [fetching, setFetching] = useState(false);
  const [state, setState] = useState({
    categories: [],
    childrenMap: {},
    pagination: { total: 0, page: 1, limit: 8 },
  });

  const fetchCategories = useCallback(
    async ({ page = 1, limit = 8, active } = {}) => {
      setFetching(true);
      try {
        const query = new URLSearchParams({ page, limit });
        if (active && active !== "all") query.append("active", active);

        const res = await apiMutate({
          endpoint: `/categories/0/children?${query}`,
          method: "get",
        });

        if (res?.success) {
          setState((prev) => ({
            ...prev,
            categories: res.data || [],
            childrenMap: {}, // Reset children on main fetch
            pagination: {
              total: res.total || res.results || res.data?.length || 0,
              page: res.page || page,
              limit: res.limit || limit,
            },
          }));
        }
        return res;
      } finally {
        setFetching(false);
      }
    },
    [apiMutate],
  );

  const fetchChildren = useCallback(
    async (parentId, active) => {
      const query = active && active !== "all" ? `?active=${active}` : "";
      const res = await apiMutate({
        endpoint: `/categories/${parentId}/children${query}`,
        method: "get",
      });

      if (res?.success) {
        setState((prev) => ({
          ...prev,
          childrenMap: { ...prev.childrenMap, [parentId]: res.data || [] },
        }));
      }
      return res;
    },
    [apiMutate],
  );

  const createCategory = useCallback(
    async (data) => {
      const res = await apiMutate({
        endpoint: "/categories",
        method: "post",
        data,
        successMessageKey: "categories.messages.createSuccess",
      });
      if (res?.success) setState((prev) => insertCategory(res.data, prev));
      return res;
    },
    [apiMutate],
  );

  const editCategory = useCallback(
    async (id, data) => {
      const res = await apiMutate({
        endpoint: `/categories/${id}`,
        method: "patch",
        data,
        successMessageKey: "categories.messages.updateSuccess",
      });
      if (res?.success)
        setState((prev) => updateCategory(id, res.data || data, prev));
      return res;
    },
    [apiMutate],
  );

  const deleteCategory = useCallback(
    async (id, deleteProducts = false) => {
      const res = await apiMutate({
        endpoint: `/categories/${id}?deleteProducts=${deleteProducts}`,
        method: "delete",
        successMessageKey: "categories.messages.deleteSuccess",
      });
      if (res?.success) setState((prev) => removeCategory(id, prev, true));
      return res;
    },
    [apiMutate],
  );

  return {
    ...state,
    loading: fetching || apiLoading,
    fetchCategories,
    fetchChildren,
    createCategory,
    updateCategory: editCategory,
    deleteCategory,
  };
}
