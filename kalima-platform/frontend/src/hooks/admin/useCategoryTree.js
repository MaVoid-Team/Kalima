import { useState, useCallback, useEffect } from "react";
export default function useCategoryTree({
  childrenMap,
  fetchChildren,
  statusFilter,
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loadingChildren, setLoadingChildren] = useState(new Set());

  // Reset expanded nodes if the global filter changes
  useEffect(() => {
    setExpandedIds(new Set());
    setLoadingChildren(new Set());
  }, [statusFilter]);

  const handleToggleExpand = useCallback(
    async (id) => {
      const nextExpanded = new Set(expandedIds);
      if (nextExpanded.has(id)) {
        nextExpanded.delete(id);
        setExpandedIds(nextExpanded);
        return;
      }

      nextExpanded.add(id);
      setExpandedIds(nextExpanded);

      if (!childrenMap[id]) {
        const nextLoading = new Set(loadingChildren);
        nextLoading.add(id);
        setLoadingChildren(nextLoading);

        await fetchChildren(id, statusFilter);

        const clearedLoading = new Set(nextLoading);
        clearedLoading.delete(id);
        setLoadingChildren(clearedLoading);
      }
    },
    [expandedIds, childrenMap, loadingChildren, fetchChildren, statusFilter],
  );

  return {
    expandedIds,
    loadingChildren,
    childrenMap,
    handleToggleExpand,
  };
}
