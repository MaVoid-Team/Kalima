import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const appRoot = path.resolve(new URL("../../../", import.meta.url).pathname);
const requireFromFrontend = createRequire(path.join(appRoot, "frontend/package.json"));
const { chromium } = requireFromFrontend("@playwright/test");
const outDir = path.join(appRoot, ".hermes/reviews/prod-block-types-smoke");
const evidencePath = path.join(outDir, "evidence.json");
const screenshotPath = path.join(outDir, "viewer.png");

const baseUrl = process.env.KALIMA_PROD_FRONTEND_URL || "https://kalima-edu.com";
const apiBase = process.env.KALIMA_PROD_API_URL || `${baseUrl}/api/v2`;
const runId = `prod-block-smoke-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${crypto.randomBytes(3).toString("hex")}`;
const includeStudentSmoke = process.env.STUDENT_SMOKE === "1";

async function loadAdminCredentials() {
  if (process.env.KALIMA_ADMIN_EMAIL && process.env.KALIMA_ADMIN_PASSWORD) {
    return { email: process.env.KALIMA_ADMIN_EMAIL, password: process.env.KALIMA_ADMIN_PASSWORD };
  }
  const envText = await fs.readFile(path.join(appRoot, ".env"), "utf8");
  const get = (key) => envText.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();
  return {
    email: get("INITIAL_ADMIN_EMAIL"),
    password: get("INITIAL_ADMIN_PASSWORD"),
  };
}

async function api(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, options);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 500) }; }
  return { status: response.status, ok: response.ok, body, headers: response.headers };
}

function assertStatus(label, result, expected = [200, 201]) {
  if (!expected.includes(result.status)) {
    throw new Error(`${label} failed: HTTP ${result.status} ${JSON.stringify(result.body).slice(0, 700)}`);
  }
}

function auth(token, extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

async function apiJson(pathname, token, body, method = "POST") {
  return api(pathname, {
    method,
    headers: auth(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
}

async function publicJson(pathname, body, method = "POST") {
  return api(pathname, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function tinyPdf() {
  return Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 69>>stream\nBT /F1 24 Tf 72 700 Td (Kalima production block smoke ${runId}) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000234 00000 n \n0000000353 00000 n \ntrailer<</Root 1 0 R/Size 6>>\nstartxref\n423\n%%EOF`);
}

function pngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAYUlEQVR4nO3PAQ3AIADAMMC/5+GiQyCk+9LbNjNn7+4D+BoYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBiYHgP4AAF9kQABgJptXAAAAABJRU5ErkJggg==",
    "base64",
  );
}

function wavBuffer() {
  const sampleRate = 8000;
  const seconds = 0.5;
  const samples = sampleRate * seconds;
  const data = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i += 1) {
    const sample = Math.round(Math.sin((i / sampleRate) * Math.PI * 2 * 440) * 12000);
    data.writeInt16LE(sample, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function upload(token, kind, buffer, filename, type, fields = {}) {
  const form = new FormData();
  const field = kind === "cover" ? "cover" : kind === "document" ? "document" : "media";
  form.append(field, new Blob([buffer], { type }), filename);
  Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
  const result = await api(`/admin/e-booklet-files/${kind}`, {
    method: "POST",
    headers: auth(token),
    body: form,
  });
  assertStatus(`upload ${filename}`, result, [201]);
  return result.body.data;
}

function hotspot(versionId, index, type, title, block, extra = {}) {
  const x = 15 + index * 11;
  return {
    template_version_id: versionId,
    page_number: 1,
    x_percent: x,
    y_percent: index % 2 === 0 ? 34 : 58,
    radius_percent: 4,
    reference_number: index + 1,
    shape: index % 3 === 0 ? "rectangle" : index % 3 === 1 ? "circle" : "triangle",
    width_percent: index % 3 === 0 ? 8 : 6,
    height_percent: 6,
    type,
    title,
    text_content: block.text_content || "",
    asset_file_id: block.asset_file_id ? Number(block.asset_file_id) : undefined,
    trigger_type: "click",
    display_behavior: { color: ["blue", "green", "amber", "violet", "red"][index % 5], opacity_percent: 90, glow_percent: 65 },
    content_json: { version: 2, blocks: [block] },
    interaction_json: extra.interaction_json || {},
  };
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const evidence = {
    runId,
    generatedAt: new Date().toISOString(),
    baseUrl,
    apiBase,
    redaction: "Credentials and bearer tokens are intentionally omitted.",
    api: {},
    browser: {},
    studentBrowser: {},
    cleanup: "not-started",
  };

  const credentials = await loadAdminCredentials();
  if (!credentials.email || !credentials.password) throw new Error("Admin credentials are required.");

  let browser;
  try {
    const health = await api("/health");
    assertStatus("health", health, [200]);
    evidence.api.health = health.body;

    const login = await api("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    assertStatus("admin login", login, [200]);
    const token = login.body.data.tokens.accessToken;
    const refreshToken = login.body.data.tokens.refreshToken;
    const loginUser = login.body.data.user;
    const portalAccess = login.body.data.portalAccess || {};
    evidence.api.adminLogin = "PASS";

    const teachers = await api("/admin/users?page=1&limit=20&role=Teacher", { headers: auth(token) });
    assertStatus("teacher list", teachers, [200]);
    const teacher = teachers.body?.data?.users?.find((user) => user?.id);
    if (!teacher) throw new Error("No teacher user available for production fixture delivery.");
    evidence.api.teacherUserId = teacher.id;

    const [documentAsset, imageAsset, audioAsset, fileAsset] = await Promise.all([
      upload(token, "document", tinyPdf(), `${runId}.pdf`, "application/pdf", { file_type: "pdf" }),
      upload(token, "hotspot-media", pngBuffer(), `${runId}-image.png`, "image/png", { file_type: "image" }),
      upload(token, "hotspot-media", wavBuffer(), `${runId}-audio.wav`, "audio/wav", { file_type: "audio" }),
      upload(token, "hotspot-media", tinyPdf(), `${runId}-file.pdf`, "application/pdf", { file_type: "file" }),
    ]);
    evidence.api.uploads = {
      document: { status: "PASS", id: documentAsset.id, mime: documentAsset.mime_type },
      image: { status: "PASS", id: imageAsset.id, mime: imageAsset.mime_type },
      audio: { status: "PASS", id: audioAsset.id, mime: audioAsset.mime_type },
      file: { status: "PASS", id: fileAsset.id, mime: fileAsset.mime_type },
    };

    const template = await apiJson("/admin/e-booklet-templates", token, {
      title: `Prod Block Smoke ${runId}`,
      slug: runId,
      description: "Temporary production smoke fixture for all e-booklet content block types.",
      price: 0,
      marketing_price: 0,
      currency: "EGP",
      status: "draft",
    });
    assertStatus("create template", template, [201]);
    const templateId = template.body.data.id;

    const version = await apiJson(`/admin/e-booklet-templates/${templateId}/versions`, token, {
      base_document_file_id: documentAsset.id,
      page_count: 1,
      page_dimensions_json: [{ width: 612, height: 792 }],
    });
    assertStatus("create version", version, [201]);
    const versionId = version.body.data.id;

    const blocks = [
      hotspot(versionId, 0, "text", "Text block smoke", { id: "text", type: "text", text_content: `Text block PASS ${runId}`, supplementary_text: "Supplementary text PASS", font_family: "Arial", arabic_font_family: "Tahoma" }),
      hotspot(versionId, 1, "image", "Image block smoke", { id: "image", type: "image", asset_file_id: imageAsset.id, alt: "Prod smoke image" }, { interaction_json: { image: { autoExpand: true, expandOnClick: true } } }),
      hotspot(versionId, 2, "audio", "Audio block smoke", { id: "audio", type: "audio", asset_file_id: audioAsset.id }, { interaction_json: { audio: { autoplay: true } } }),
      hotspot(versionId, 3, "video", "Video block smoke", { id: "video", type: "video", source: "youtube", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
      hotspot(versionId, 4, "file", "File block smoke", { id: "file", type: "file", asset_file_id: fileAsset.id, filename: `${runId}-file.pdf` }),
      hotspot(versionId, 5, "link", "URL block smoke", { id: "link", type: "link", url: "https://kalima-edu.com", label: "Kalima URL smoke" }),
      hotspot(versionId, 6, "question_answer", "Question block smoke", { id: "qa", type: "question_answer", question: "Production question block?", answers: [{ text: "Correct PASS", isCorrect: true }, { text: "Wrong option", isCorrect: false }] }),
    ];

    const hotspotResults = [];
    for (const item of blocks) {
      const created = await apiJson(`/admin/e-booklet-template-versions/${versionId}/hotspots`, token, item);
      assertStatus(`create hotspot ${item.type}`, created, [201]);
      hotspotResults.push({ type: item.type, id: created.body.data.id });
    }
    evidence.api.hotspots = hotspotResults;

    const publish = await apiJson(`/admin/e-booklet-template-versions/${versionId}/publish`, token, {}, "POST");
    assertStatus("publish version", publish, [200]);

    const purchase = await apiJson("/admin/e-booklet-purchases", token, {
      teacher_id: teacher.id,
      template_id: templateId,
      template_version_id: versionId,
      branding_json: {},
      price: 0,
      marketing_price: 0,
      internal_price: 0,
      currency: "EGP",
      notes: runId,
    });
    assertStatus("create teacher deal", purchase, [201]);
    const purchaseId = purchase.body.data.id || purchase.body.data.purchase_id;

    const paid = await apiJson(`/admin/e-booklet-purchases/${purchaseId}/status`, token, { status: "paid", admin_notes: runId }, "PATCH");
    assertStatus("mark teacher deal paid", paid, [200]);

    const delivery = await apiJson(`/admin/e-booklet-purchases/${purchaseId}/deliver`, token, {
      custom_document_file_id: documentAsset.id,
      display_title: `Prod Block Smoke ${runId}`,
      invite_quota: 1,
      page_count: 1,
      page_dimensions: [{ width: 612, height: 792 }],
      access_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      student_marketing_price: 0,
      internal_price: 0,
    });
    assertStatus("deliver instance", delivery, [200, 201]);
    const instanceId = delivery.body.data.id;
    evidence.api.fixture = { templateId, versionId, purchaseId, instanceId };

    const pageApi = await api(`/admin/e-booklet-viewer/${instanceId}/pages/1/hotspots`, { headers: auth(token) });
    assertStatus("admin viewer hotspots API", pageApi, [200]);
    evidence.api.viewerHotspotTypes = pageApi.body.data.map((item) => item.type);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: baseUrl });
    await context.addInitScript(({ tokenValue, refreshTokenValue, userValue, portalAccessValue }) => {
      window.localStorage.setItem("token", tokenValue);
      window.localStorage.setItem("accessToken", tokenValue);
      if (refreshTokenValue) window.localStorage.setItem("refreshToken", refreshTokenValue);
      window.localStorage.setItem("user", JSON.stringify(userValue));
      window.localStorage.setItem("portalAccess", JSON.stringify(portalAccessValue));
      window.localStorage.setItem("kalima:auth:accessToken", tokenValue);
    }, { tokenValue: token, refreshTokenValue: refreshToken, userValue: loginUser, portalAccessValue: portalAccess });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.goto(`/admin/e-booklets/access/${instanceId}/view`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-testid="e-booklet-viewer-page"]', { timeout: 20000 });
    await page.waitForFunction(() => document.querySelectorAll('button[aria-label*="smoke"], button[aria-label*="block"]').length >= 7, null, { timeout: 20000 });

    const checks = [];
    async function openAndCheck(title, fn) {
      await page.getByRole("button", { name: new RegExp(title, "i") }).click();
      await page.waitForSelector("text=/block smoke|Production question|Kalima URL|Correct PASS|Text block PASS/i", { timeout: 10000 }).catch(() => {});
      const result = await fn();
      checks.push({ title, ...result });
      await page.getByRole("button", { name: /close/i }).click();
    }

    await openAndCheck("Text block smoke", async () => {
      await page.getByText(/Text block PASS/i).waitFor({ timeout: 10000 });
      return { status: await page.getByText(/Text block PASS/i).isVisible() ? "PASS" : "FAIL" };
    });
    await openAndCheck("Image block smoke", async () => page.locator("img[alt='Prod smoke image']").evaluate((img) => ({ status: img.naturalWidth > 0 && img.naturalHeight > 0 ? "PASS" : "FAIL", naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, maxHeightClassPresent: img.className.includes("max-h-[70vh]") })));
    await openAndCheck("Audio block smoke", async () => page.locator("audio").evaluate(async (audio) => {
      const canPlay = audio.canPlayType("audio/wav");
      let playResult = "not-attempted";
      try { await audio.play(); playResult = "resolved"; } catch (error) { playResult = error.name || "rejected"; }
      return { status: canPlay ? "PASS" : "FAIL", autoplay: audio.autoplay, controls: audio.controls, canPlay, playResult, readyState: audio.readyState };
    }));
    await openAndCheck("Video block smoke", async () => page.locator("iframe[src*='youtube-nocookie.com/embed']").evaluate((iframe) => ({ status: iframe.src.includes("youtube-nocookie.com/embed") ? "PASS" : "FAIL", srcHost: new URL(iframe.src).host })));
    await openAndCheck("File block smoke", async () => page.locator("iframe").last().evaluate((iframe) => ({ status: iframe.src.startsWith("blob:") ? "PASS" : "FAIL", hasSandbox: iframe.hasAttribute("sandbox") })));
    await openAndCheck("URL block smoke", async () => page.getByRole("link", { name: /Kalima URL smoke/i }).evaluate((link) => ({ status: link.href === "https://kalima-edu.com/" ? "PASS" : "FAIL", href: link.href, target: link.target })));
    await openAndCheck("Question block smoke", async () => {
      await page.getByRole("button", { name: /Correct PASS/i }).click();
      const selected = await page.getByRole("button", { name: /Correct PASS/i }).evaluate((button) => button.className.includes("emerald"));
      return { status: selected ? "PASS" : "FAIL", correctSelectionStyled: selected };
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });
    evidence.browser = {
      route: `${baseUrl}/admin/e-booklets/access/${instanceId}/view`,
      checks,
      screenshot: path.relative(appRoot, screenshotPath),
      consoleErrorCount: consoleErrors.length,
      consoleErrors: consoleErrors.slice(0, 5),
    };

    const allPassed = checks.every((check) => check.status === "PASS");
    evidence.status = allPassed ? "PASS" : "FAIL";

    if (includeStudentSmoke) {
      const impersonation = await apiJson("/auth/admin/impersonation/start", token, { targetUserId: teacher.id });
      assertStatus("start teacher impersonation", impersonation, [200, 201]);
      const teacherToken = impersonation.body.data.tokens.accessToken;
      const currentTerms = await api("/teacher/e-booklet-terms/current", { headers: auth(teacherToken) });
      assertStatus("get teacher current code-generation terms", currentTerms, [200]);
      const termId = currentTerms.body.data?.id;
      if (!termId) throw new Error("No active teacher code-generation terms returned.");
      const acceptTerms = await apiJson("/teacher/e-booklet-terms/accept-code-generation", teacherToken, { templateId }, "POST");
      assertStatus("teacher accept code-generation terms", acceptTerms, [200]);
      const generatedCode = await apiJson(`/teacher/e-booklets/${instanceId}/access-codes`, teacherToken, {
        kind: "paid",
        termId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        maxRedemptions: 1,
      });
      assertStatus("teacher generate paid access code", generatedCode, [201]);
      const code = generatedCode.body.data.code;

      const [levels, governments] = await Promise.all([
        api("/levels"),
        api("/governments"),
      ]);
      assertStatus("levels", levels, [200]);
      assertStatus("governments", governments, [200]);
      const levelId = (levels.body.data || levels.body || [])[0]?.id;
      const governmentId = (governments.body.data || governments.body || [])[0]?.id;
      if (!levelId || !governmentId) throw new Error("Missing level/government fixture for student registration.");
      const zones = await api(`/governments/${governmentId}/zones`);
      assertStatus("zones", zones, [200]);
      const zoneId = (zones.body.data || zones.body || [])[0]?.id;
      if (!zoneId) throw new Error("Missing zone fixture for student registration.");

      const studentPassword = `Qa${crypto.randomBytes(8).toString("base64url")}1!`;
      const studentEmail = `${runId}@student-smoke.qa`;
      const studentRegister = await publicJson("/auth/register/student", {
        name: `Student Smoke ${runId}`,
        email: studentEmail,
        password: studentPassword,
        phone: `010${crypto.randomInt(10000000, 99999999)}`,
        gender: "male",
        level_id: Number(levelId),
        government_id: Number(governmentId),
        zone_id: Number(zoneId),
        parent_phone_number: `011${crypto.randomInt(10000000, 99999999)}`,
        faction: "production-smoke",
      });
      assertStatus("register disposable student", studentRegister, [201]);
      const studentToken = studentRegister.body.data.tokens.accessToken;
      const studentRefreshToken = studentRegister.body.data.tokens.refreshToken;
      const studentUser = studentRegister.body.data.user;
      const studentPortalAccess = studentRegister.body.data.portalAccess || { academy: { hasAccess: true, roles: ["Student"] } };

      const redeem = await apiJson("/e-booklet-access-codes/redeem", studentToken, {
        code,
        termsAccepted: true,
        termsVersion: runId,
      });
      assertStatus("student redeem teacher paid code", redeem, [200]);

      const studentList = await api("/student/e-booklets", { headers: auth(studentToken) });
      assertStatus("student e-booklet list", studentList, [200]);
      evidence.api.student = {
        registeredUserId: studentUser.id,
        teacherImpersonation: "PASS",
        teacherTermsAccepted: "PASS",
        paidCodeGenerated: "PASS",
        paidCodeRedeemed: "PASS",
        studentListHasInstance: Array.isArray(studentList.body.data) && studentList.body.data.some((item) => Number(item.booklet_instance_id || item.booklet_instance?.id) === Number(instanceId)),
      };

      const studentContext = await browser.newContext({ baseURL: baseUrl });
      await studentContext.addInitScript(({ tokenValue, refreshTokenValue, userValue, portalAccessValue }) => {
        window.localStorage.setItem("accessToken", tokenValue);
        if (refreshTokenValue) window.localStorage.setItem("refreshToken", refreshTokenValue);
        window.localStorage.setItem("user", JSON.stringify(userValue));
        window.localStorage.setItem("portalAccess", JSON.stringify(portalAccessValue));
      }, { tokenValue: studentToken, refreshTokenValue: studentRefreshToken, userValue: studentUser, portalAccessValue: studentPortalAccess });
      const studentPage = await studentContext.newPage();
      const studentConsoleErrors = [];
      studentPage.on("console", (message) => {
        if (message.type() === "error") studentConsoleErrors.push(message.text());
      });
      await studentPage.goto(`/student/e-booklets/${instanceId}`, { waitUntil: "networkidle" });
      await studentPage.waitForSelector('[data-testid="e-booklet-viewer-page"]', { timeout: 20000 });
      await studentPage.waitForFunction(() => document.querySelectorAll('button[aria-label*="smoke"], button[aria-label*="block"]').length >= 7, null, { timeout: 20000 });

      const studentChecks = [];
      async function studentOpenAndCheck(title, fn) {
        await studentPage.getByRole("button", { name: new RegExp(title, "i") }).click();
        const result = await fn();
        studentChecks.push({ title, ...result });
        await studentPage.getByRole("button", { name: /close/i }).click();
      }
      await studentOpenAndCheck("Text block smoke", async () => {
        await studentPage.getByText(/Text block PASS/i).waitFor({ timeout: 10000 });
        return { status: "PASS" };
      });
      await studentOpenAndCheck("Image block smoke", async () => studentPage.locator("img[alt='Prod smoke image']").evaluate((img) => ({ status: img.naturalWidth > 0 && img.naturalHeight > 0 ? "PASS" : "FAIL", naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, maxHeightClassPresent: img.className.includes("max-h-[70vh]") })));
      await studentOpenAndCheck("Audio block smoke", async () => studentPage.locator("audio").evaluate(async (audio) => {
        let playResult = "not-attempted";
        try { await audio.play(); playResult = "resolved"; } catch (error) { playResult = error.name || "rejected"; }
        return { status: audio.canPlayType("audio/wav") ? "PASS" : "FAIL", autoplay: audio.autoplay, controls: audio.controls, playResult, readyState: audio.readyState };
      }));
      await studentOpenAndCheck("Video block smoke", async () => studentPage.locator("iframe[src*='youtube-nocookie.com/embed']").evaluate((iframe) => ({ status: iframe.src.includes("youtube-nocookie.com/embed") ? "PASS" : "FAIL", srcHost: new URL(iframe.src).host })));
      await studentOpenAndCheck("File block smoke", async () => studentPage.locator("iframe").last().evaluate((iframe) => ({ status: iframe.src.startsWith("blob:") ? "PASS" : "FAIL", hasSandbox: iframe.hasAttribute("sandbox") })));
      await studentOpenAndCheck("URL block smoke", async () => studentPage.getByRole("link", { name: /Kalima URL smoke/i }).evaluate((link) => ({ status: link.href === "https://kalima-edu.com/" ? "PASS" : "FAIL", href: link.href, target: link.target })));
      await studentOpenAndCheck("Question block smoke", async () => {
        await studentPage.getByRole("button", { name: /Correct PASS/i }).click();
        const selected = await studentPage.getByRole("button", { name: /Correct PASS/i }).evaluate((button) => button.className.includes("emerald"));
        return { status: selected ? "PASS" : "FAIL", correctSelectionStyled: selected };
      });
      const studentScreenshotPath = path.join(outDir, "student-viewer.png");
      await studentPage.screenshot({ path: studentScreenshotPath, fullPage: true });
      await studentContext.close();
      evidence.studentBrowser = {
        route: `${baseUrl}/student/e-booklets/${instanceId}`,
        checks: studentChecks,
        screenshot: path.relative(appRoot, studentScreenshotPath),
        consoleErrorCount: studentConsoleErrors.length,
        consoleErrors: studentConsoleErrors.slice(0, 5),
      };
      evidence.status = allPassed && studentChecks.every((check) => check.status === "PASS") ? "PASS" : "FAIL";
    }

    const revokeAccess = await apiJson(`/admin/e-booklet-instances/${instanceId}/revoke-access`, token, {}, "POST");
    const archiveTemplate = await apiJson(`/admin/e-booklet-templates/${templateId}`, token, { status: "archived" }, "PATCH");
    evidence.cleanup = revokeAccess.ok && archiveTemplate.ok
      ? `teacher access revoked; temporary template ${templateId} archived; uploaded private smoke assets retained because no e-booklet file delete endpoint is exposed`
      : `cleanup warning: revoke HTTP ${revokeAccess.status}, archive HTTP ${archiveTemplate.status}`;
  } catch (error) {
    evidence.status = "FAIL";
    evidence.error = error.message;
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await fs.writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ status: evidence.status, evidencePath, screenshotPath: evidence.browser?.screenshot ? screenshotPath : null, error: evidence.error }, null, 2));
  }
}

main();
