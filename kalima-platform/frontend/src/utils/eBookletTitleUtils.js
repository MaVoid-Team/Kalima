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
  const brandingJson = instance?.branding_json || instanceOrLink?.branding_json || instanceOrLink?.purchase?.branding_json;
  const customTeacherTitle = brandingJson?.bookletTitle?.trim?.();

  if (customTeacherTitle && !isGeneratedEBookletTitle(customTeacherTitle)) {
    return customTeacherTitle;
  }

  const templateTitle = template?.title?.trim?.();
  if (templateTitle) {
    return templateTitle;
  }

  const displayTitle = instance?.display_title?.trim?.();
  if (displayTitle && !isGeneratedEBookletTitle(displayTitle)) {
    return displayTitle;
  }

  if (displayTitle) {
    return displayTitle;
  }

  return fallback;
};
