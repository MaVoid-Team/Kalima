import { role_enum } from '../generated/prisma/client';
import { employeePerformanceRoleGuard } from './employeePerformanceAuth';

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

  employeePerformanceRoleGuard(request as any, {} as any, next);

  return next;
}

describe('employeePerformanceRoleGuard', () => {
  it('allows Admin users', () => {
    const next = runGuard(role_enum.Admin);

    expect(next).toHaveBeenCalledWith();
  });

  it.each([role_enum.SubAdmin, role_enum.Moderator])('denies %s users', (role) => {
    const next = runGuard(role);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });
});
