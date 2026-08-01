const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

export function getViewerPageCount(metadata, previewMode = false) {
  const previewPageCount = Number(metadata?.preview_page_count);
  const versionPageCount = Number(metadata?.booklet_instance?.template_version?.page_count);

  if (previewMode && isPositiveInteger(previewPageCount)) return previewPageCount;
  if (isPositiveInteger(versionPageCount)) return versionPageCount;
  return 1;
}
