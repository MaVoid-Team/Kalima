import { role_enum } from '../generated/prisma/client';
import { adminAnalyticsRoleGuard } from './adminAnalyticsAuth';

jest.mock('../../../libs/auth/middleware', () => ({
  authenticateToken: jest.fn(),
}));

function runGuard(role: role_enum) {
  const next = jest.fn();
  const request = {
    user: {
      roles: [{ portal: 'store', role }],
    },
  };

  adminAnalyticsRoleGuard(request as any, {} as any, next);

  return next;
}

describe('adminAnalyticsRoleGuard', () => {
  it('allows Admin users', () => {
    const next = runGuard(role_enum.Admin);

    expect(next).toHaveBeenCalledWith();
  });

  it.each([role_enum.SubAdmin, role_enum.Moderator, role_enum.Assistant])(
    'denies %s users',
    (role) => {
      const next = runGuard(role);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 }),
      );
    },
  );
});
