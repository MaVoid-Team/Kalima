import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const frontendUrl = process.env.KALIMA_FRONTEND_URL || 'http://127.0.0.1:5173';
const backendUrl = process.env.KALIMA_BACKEND_URL || 'http://127.0.0.1:5001';
const adminEmail = process.env.KALIMA_E2E_ADMIN_EMAIL;
const adminPassword = process.env.KALIMA_E2E_ADMIN_PASSWORD;
const proofDir = '/Users/ziadnasreldin/Documents/GitHub/Kalima/.codex/e2e-proof/samples-numbering';
const screenshotPath = `${proofDir}/samples-numbering-sequence.png`;

const readSections = async () => {
  const response = await fetch(`${backendUrl}/api/v2/sample-sections`);
  if (!response.ok) throw new Error(`Sample sections request failed with HTTP ${response.status}`);
  return (await response.json()).data || [];
};

const deleteCreatedSections = async (session, titles) => {
  const sections = await readSections();
  const createdTitles = new Set(Object.values(titles));
  for (const section of sections) {
    if (!createdTitles.has(section.title)) continue;
    await fetch(`${backendUrl}/api/v2/sample-sections/${section.id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${session.tokens.accessToken}` },
    });
  }
};

const login = async () => {
  const response = await fetch(`${backendUrl}/api/v2/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  if (!response.ok) throw new Error(`Local admin login failed with HTTP ${response.status}`);
  return (await response.json()).data;
};

const sectionRow = (page, title) => page.getByRole('row').filter({ hasText: title });

const fillSectionDialog = async (page, { title, sortOrder }) => {
  const dialog = page.getByRole('dialog');
  await dialog.locator('#title').fill(title);
  await dialog.getByTestId('sample-section-sort-order-input').fill(String(sortOrder));
  const saveResponse = page.waitForResponse(
    (response) => response.url().includes('/api/v2/sample-sections')
      && response.request().method() === 'POST',
    { timeout: 15_000 },
  );
  await dialog.getByRole('button', { name: /save/i }).click();
  const response = await saveResponse;
  if (!response.ok()) throw new Error(`Section create returned HTTP ${response.status()}`);
  await page.waitForFunction(() => !document.querySelector('[role="dialog"][data-state="open"]'));
};

const createSection = async (page, title, sortOrder) => {
  await page.getByTestId('sections-add-button').click();
  await fillSectionDialog(page, { title, sortOrder });
  await sectionRow(page, title).waitFor();
};

const getDisplayedOrder = async (page, title) => {
  const row = sectionRow(page, title);
  return Number((await row.getByTestId(/sample-section-order-/).textContent()).trim());
};

const main = async () => {
  if (!adminEmail || !adminPassword) {
    throw new Error('Set KALIMA_E2E_ADMIN_EMAIL and KALIMA_E2E_ADMIN_PASSWORD for the local browser flow.');
  }
  mkdirSync(proofDir, { recursive: true });
  const session = await login();
  const existingSections = await readSections();
  const highestExistingOrder = existingSections.reduce(
    (highest, section) => Math.max(highest, Number(section.sort_order) || 0),
    0,
  );
  const baseOrder = highestExistingOrder + 100;
  const runId = Date.now();
  const titles = {
    anchor: `Samples numbering anchor ${runId}`,
    tail: `Samples numbering tail ${runId}`,
    inserted: `Samples numbering inserted ${runId}`,
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript((authSession) => {
    localStorage.setItem('accessToken', authSession.tokens.accessToken);
    localStorage.setItem('refreshToken', authSession.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(authSession.user));
    localStorage.setItem('portalAccess', JSON.stringify(authSession.portalAccess));
  }, session);
  const page = await context.newPage();

  try {
    await page.goto(`${frontendUrl}/admin/samples`, { waitUntil: 'networkidle' });
    await page.getByTestId('admin-sample-sections-page').waitFor();

    await createSection(page, titles.anchor, baseOrder);
    await createSection(page, titles.tail, baseOrder + 1);
    await createSection(page, titles.inserted, baseOrder + 1);

    if (await getDisplayedOrder(page, titles.anchor) !== baseOrder) throw new Error('Anchor did not keep its assigned number');
    if (await getDisplayedOrder(page, titles.inserted) !== baseOrder + 1) throw new Error('Inserted section did not keep its assigned number');
    if (await getDisplayedOrder(page, titles.tail) !== baseOrder + 2) throw new Error('Later section was not automatically shifted on create');

    const insertedRow = sectionRow(page, titles.inserted);
    await insertedRow.getByTitle(/edit/i).click();
    const editDialog = page.getByRole('dialog');
    await editDialog.getByTestId('sample-section-sort-order-input').fill(String(baseOrder));
    const updateResponse = page.waitForResponse(
      (response) => response.url().includes('/api/v2/sample-sections/')
        && response.request().method() === 'PATCH',
      { timeout: 15_000 },
    );
    await editDialog.getByRole('button', { name: /save/i }).click();
    const response = await updateResponse;
    if (!response.ok()) throw new Error(`Section update returned HTTP ${response.status()}`);
    await page.waitForFunction(() => !document.querySelector('[role="dialog"][data-state="open"]'));

    if (await getDisplayedOrder(page, titles.inserted) !== baseOrder) throw new Error('Edited section did not move to its assigned number');
    if (await getDisplayedOrder(page, titles.anchor) !== baseOrder + 1) throw new Error('Crossed section was not shifted on edit');
    if (await getDisplayedOrder(page, titles.tail) !== baseOrder + 2) throw new Error('Uncrossed later section changed unexpectedly');

    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Samples numbering browser E2E passed. Screenshot: ${screenshotPath}`);
  } finally {
    await deleteCreatedSections(session, titles);
    await context.close();
    await browser.close();
  }
};

main().catch((error) => {
  console.error(`Samples numbering browser E2E failed: ${error.message}`);
  process.exitCode = 1;
});
