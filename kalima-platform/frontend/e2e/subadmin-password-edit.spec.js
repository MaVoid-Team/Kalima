import { expect, test } from '@playwright/test';

const mockUsers = [
  {
    id: 101,
    name: 'Admin User',
    email: 'admin@kalima.com',
    phone: '01011111111',
    role: 'Admin',
    user_roles: [{ portal: 'store', role: 'Admin' }],
    is_email_verified: true,
    is_deleted: false,
    confirmed: true,
  },
  {
    id: 102,
    name: 'SubAdmin User',
    email: 'subadmin2@kalima.com',
    phone: '01022222222',
    role: 'SubAdmin',
    user_roles: [{ portal: 'store', role: 'SubAdmin' }],
    is_email_verified: true,
    is_deleted: false,
    confirmed: true,
  },
  {
    id: 103,
    name: 'Teacher User',
    email: 'teacher@kalima.com',
    phone: '01033333333',
    role: 'Teacher',
    user_roles: [{ portal: 'store', role: 'Teacher' }],
    is_email_verified: true,
    is_deleted: false,
    confirmed: true,
  },
  {
    id: 104,
    name: 'Student User',
    email: 'student@kalima.com',
    phone: '01044444444',
    role: 'Student',
    user_roles: [{ portal: 'store', role: 'Student' }],
    is_email_verified: true,
    is_deleted: false,
    confirmed: true,
  },
];

test.describe('SubAdmin and Admin Password Edit Functionality', () => {
  test('SubAdmin can edit password for non-admin users but NOT for admin users', async ({ page }) => {
    let passwordResetPayload = null;
    let passwordResetUserId = null;

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'test-subadmin-token');
      localStorage.setItem('refreshToken', 'test-subadmin-refresh');
      localStorage.setItem('user', JSON.stringify({ id: 99, name: 'Main SubAdmin', role: 'SubAdmin', confirmed: true }));
      localStorage.setItem('portalAccess', JSON.stringify({
        store: { hasAccess: true, roles: ['SubAdmin'] },
        academy: { hasAccess: true, roles: [] },
      }));
    });

    await page.route('**/api/v2/**', async (route) => {
      const url = new URL(route.request().url());

      if (url.pathname === '/api/v2/admin/users' && route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              users: mockUsers,
              pagination: { page: 1, totalPages: 1, total: 4, limit: 20 },
            },
          }),
        });
        return;
      }

      if (url.pathname.match(/\/api\/v2\/admin\/users\/(\d+)\/password$/) && route.request().method() === 'PATCH') {
        const match = url.pathname.match(/\/api\/v2\/admin\/users\/(\d+)\/password$/);
        passwordResetUserId = match ? match[1] : null;
        passwordResetPayload = JSON.parse(route.request().postData() || '{}');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'User password updated successfully',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto('/admin/users');

    // Verify page loads and table rows exist
    await expect(page.getByTestId('users-table-row-101')).toBeVisible();
    await expect(page.getByTestId('users-table-row-102')).toBeVisible();
    await expect(page.getByTestId('users-table-row-103')).toBeVisible();
    await expect(page.getByTestId('users-table-row-104')).toBeVisible();

    // Verify SubAdmin DOES NOT see password edit button for Admin (101)
    await expect(page.getByTestId('users-table-password-101')).not.toBeVisible();

    // Verify SubAdmin DOES see password edit button for other SubAdmin (102), Teacher (103), Student (104)
    await expect(page.getByTestId('users-table-password-102')).toBeVisible();
    await expect(page.getByTestId('users-table-password-103')).toBeVisible();
    await expect(page.getByTestId('users-table-password-104')).toBeVisible();

    // Click password edit on Teacher (103)
    await page.getByTestId('users-table-password-103').click();

    // Dialog should open
    await expect(page.getByTestId('users-table-password-input')).toBeVisible();
    await expect(page.getByTestId('users-table-confirm-password-input')).toBeVisible();

    // Validation: too short
    await page.getByTestId('users-table-password-input').fill('123');
    await page.getByTestId('users-table-confirm-password-input').fill('123');
    await page.getByTestId('users-table-password-submit').click();
    await expect(page.getByTestId('users-table-password-error')).toBeVisible();

    // Validation: mismatch
    await page.getByTestId('users-table-password-input').fill('newpassword123');
    await page.getByTestId('users-table-confirm-password-input').fill('mismatchpassword123');
    await page.getByTestId('users-table-password-submit').click();
    await expect(page.getByTestId('users-table-password-error')).toBeVisible();

    // Valid submission
    await page.getByTestId('users-table-password-input').fill('newSecretPassword2026');
    await page.getByTestId('users-table-confirm-password-input').fill('newSecretPassword2026');
    await page.getByTestId('users-table-password-submit').click();

    // Dialog should close and API should have been called
    await expect(page.getByTestId('users-table-password-input')).not.toBeVisible();
    expect(passwordResetUserId).toBe('103');
    expect(passwordResetPayload).toEqual({ password: 'newSecretPassword2026' });
  });

  test('Admin can edit password for all users including Admin accounts', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'test-admin-token');
      localStorage.setItem('refreshToken', 'test-admin-refresh');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Super Admin', role: 'Admin', confirmed: true }));
      localStorage.setItem('portalAccess', JSON.stringify({
        store: { hasAccess: true, roles: ['Admin'] },
        academy: { hasAccess: true, roles: [] },
      }));
    });

    await page.route('**/api/v2/**', async (route) => {
      const url = new URL(route.request().url());

      if (url.pathname === '/api/v2/admin/users' && route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              users: mockUsers,
              pagination: { page: 1, totalPages: 1, total: 4, limit: 20 },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto('/admin/users');

    // Verify Admin sees password edit button for ALL users (101 Admin, 102 SubAdmin, 103 Teacher, 104 Student)
    await expect(page.getByTestId('users-table-password-101')).toBeVisible();
    await expect(page.getByTestId('users-table-password-102')).toBeVisible();
    await expect(page.getByTestId('users-table-password-103')).toBeVisible();
    await expect(page.getByTestId('users-table-password-104')).toBeVisible();
  });
});
