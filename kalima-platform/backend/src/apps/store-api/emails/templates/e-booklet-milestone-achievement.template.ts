export interface EBookletMilestoneEmailData {
  teacherName: string;
  milestoneTitle: string;
  paidRedemptions: number;
  rewardAmount: number;
  termName?: string | null;
  dashboardUrl?: string;
}

const money = (value: number) => `${Number(value ?? 0).toLocaleString("en-US")} EGP`;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(value?: string): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return escapeHtml(value);
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return escapeHtml(url.toString());
  } catch {
    return null;
  }
  return null;
}

export function getEBookletMilestoneTeacherEmailSubject(data: EBookletMilestoneEmailData): string {
  return `Kalima milestone achieved: ${data.milestoneTitle}`;
}

export function getEBookletMilestoneTeacherEmailText(data: EBookletMilestoneEmailData): string {
  return [
    `Congratulations ${data.teacherName},`,
    `You achieved the ${data.milestoneTitle} milestone${data.termName ? ` for ${data.termName}` : ""}.`,
    `Paid redemptions: ${data.paidRedemptions}.`,
    `Claimable wallet credit: ${money(data.rewardAmount)}.`,
    data.dashboardUrl ? `Open your e-booklet dashboard: ${data.dashboardUrl}` : "Open your e-booklet dashboard to claim the reward.",
  ].join("\n");
}

export function getEBookletMilestoneTeacherEmailHtml(data: EBookletMilestoneEmailData): string {
  const href = safeHref(data.dashboardUrl);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>Congratulations ${escapeHtml(data.teacherName)}</h2>
      <p>You achieved the <strong>${escapeHtml(data.milestoneTitle)}</strong> milestone${data.termName ? ` for <strong>${escapeHtml(data.termName)}</strong>` : ""}.</p>
      <ul>
        <li>Paid redemptions: <strong>${escapeHtml(data.paidRedemptions)}</strong></li>
        <li>Claimable wallet credit: <strong>${escapeHtml(money(data.rewardAmount))}</strong></li>
      </ul>
      ${href ? `<p><a href="${href}">Open your e-booklet dashboard</a> to claim the reward.</p>` : "<p>Open your e-booklet dashboard to claim the reward.</p>"}
    </div>
  `;
}

export function getEBookletMilestoneAdminEmailSubject(data: EBookletMilestoneEmailData): string {
  return `E-booklet milestone achieved by ${data.teacherName}`;
}

export function getEBookletMilestoneAdminEmailText(data: EBookletMilestoneEmailData): string {
  return [
    `${data.teacherName} achieved ${data.milestoneTitle}${data.termName ? ` for ${data.termName}` : ""}.`,
    `Paid redemptions: ${data.paidRedemptions}.`,
    `Reward amount: ${money(data.rewardAmount)}.`,
    data.dashboardUrl ? `Review: ${data.dashboardUrl}` : "Review the teacher milestone dashboard.",
  ].join("\n");
}

export function getEBookletMilestoneAdminEmailHtml(data: EBookletMilestoneEmailData): string {
  const href = safeHref(data.dashboardUrl);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>E-booklet milestone achieved</h2>
      <p><strong>${escapeHtml(data.teacherName)}</strong> achieved <strong>${escapeHtml(data.milestoneTitle)}</strong>${data.termName ? ` for <strong>${escapeHtml(data.termName)}</strong>` : ""}.</p>
      <ul>
        <li>Paid redemptions: <strong>${escapeHtml(data.paidRedemptions)}</strong></li>
        <li>Reward amount: <strong>${escapeHtml(money(data.rewardAmount))}</strong></li>
      </ul>
      ${href ? `<p><a href="${href}">Review achievement</a></p>` : ""}
    </div>
  `;
}
