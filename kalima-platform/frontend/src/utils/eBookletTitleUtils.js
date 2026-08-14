export const isGeneratedEBookletTitle = (value) => {
  const trimmed = String(value || "").trim();
  return (
    /^Teacher e-booklet #\d+$/i.test(trimmed) ||
    /^e-booklet #\d+$/i.test(trimmed) ||
    /^كتاب إلكتروني #\d+$/i.test(trimmed) ||
    /^مذكرة إلكترونية #\d+$/i.test(trimmed)
  );
};

export const getEBookletDisplayTitle = (instanceOrLink, fallback = "") => {
  if (!instanceOrLink) return fallback;

  // Supports: instance object, access record, or order link
  const instance = instanceOrLink.booklet_instance || instanceOrLink.instance || instanceOrLink;
  const template = instanceOrLink.template || instance?.template;

  const displayTitle = instance?.display_title?.trim?.();
  if (displayTitle && !isGeneratedEBookletTitle(displayTitle)) {
    return displayTitle;
  }

  const templateTitle = template?.title?.trim?.();
  if (templateTitle) {
    return templateTitle;
  }

  if (displayTitle) {
    return displayTitle;
  }

  return fallback;
};
