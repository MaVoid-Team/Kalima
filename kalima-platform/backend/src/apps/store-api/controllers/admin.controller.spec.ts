import "reflect-metadata";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("../services/user-management.service", () => ({
  userManagementService: {
    findUserById: jest.fn(),
    hashPassword: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

jest.mock("../../../libs/auth/jwt", () => ({
  revokeAllRefreshTokensForUser: jest.fn(),
}));

import { adminController } from "./admin.controller";
import { userManagementService } from "../services/user-management.service";
import { role_enum, portal_enum } from "../generated/prisma/client";
import { BadRequestError, ForbiddenError, ValidationError } from "../../../libs/errors";
import { revokeAllRefreshTokensForUser } from "../../../libs/auth/jwt";

function createRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("adminController.resetUserPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid user IDs", async () => {
    const req: any = {
      params: { userId: "abc" },
      body: { password: "newPassword123" },
      user: { userId: 1, roles: [{ role: role_enum.Admin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    expect(next.mock.calls[0][0].message).toBe("Invalid user ID");
  });

  it("rejects when target user is not found", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue(null);

    const req: any = {
      params: { userId: "99" },
      body: { password: "newPassword123" },
      user: { userId: 1, roles: [{ role: role_enum.Admin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    expect(next.mock.calls[0][0].message).toBe("User not found");
  });

  it("rejects password shorter than 8 characters", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 10,
      name: "Student User",
      role: role_enum.Student,
      user_roles: [{ role: role_enum.Student, portal: portal_enum.store }],
    });

    const req: any = {
      params: { userId: "10" },
      body: { password: "123" },
      user: { userId: 1, roles: [{ role: role_enum.Admin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(userManagementService.updatePassword).not.toHaveBeenCalled();
  });

  it("allows Admin to reset password for a regular user (Teacher)", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 10,
      name: "Teacher User",
      role: role_enum.Teacher,
      user_roles: [{ role: role_enum.Teacher, portal: portal_enum.store }],
    });
    (userManagementService.hashPassword as jest.Mock).mockResolvedValue("hashed_pass_123");
    (userManagementService.updatePassword as jest.Mock).mockResolvedValue(undefined);

    const req: any = {
      params: { userId: "10" },
      body: { password: "newSecurePassword123" },
      user: { userId: 1, roles: [{ role: role_enum.Admin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(userManagementService.hashPassword).toHaveBeenCalledWith("newSecurePassword123");
    expect(userManagementService.updatePassword).toHaveBeenCalledWith(10, "hashed_pass_123");
    expect(revokeAllRefreshTokensForUser).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "User password updated successfully",
    }));
  });

  it("allows Admin to reset password for another Admin", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 2,
      name: "Another Admin",
      role: role_enum.Admin,
      user_roles: [{ role: role_enum.Admin, portal: portal_enum.store }],
    });
    (userManagementService.hashPassword as jest.Mock).mockResolvedValue("hashed_admin_pass");
    (userManagementService.updatePassword as jest.Mock).mockResolvedValue(undefined);

    const req: any = {
      params: { userId: "2" },
      body: { password: "newAdminPassword123" },
      user: { userId: 1, roles: [{ role: role_enum.Admin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(userManagementService.updatePassword).toHaveBeenCalledWith(2, "hashed_admin_pass");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("allows SubAdmin to reset password for a regular user (Student)", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 15,
      name: "Student User",
      role: role_enum.Student,
      user_roles: [{ role: role_enum.Student, portal: portal_enum.store }],
    });
    (userManagementService.hashPassword as jest.Mock).mockResolvedValue("hashed_student_pass");
    (userManagementService.updatePassword as jest.Mock).mockResolvedValue(undefined);

    const req: any = {
      params: { userId: "15" },
      body: { password: "studentNewPassword123" },
      user: { userId: 5, roles: [{ role: role_enum.SubAdmin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(userManagementService.updatePassword).toHaveBeenCalledWith(15, "hashed_student_pass");
    expect(revokeAllRefreshTokensForUser).toHaveBeenCalledWith(15);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("allows SubAdmin to reset password for another SubAdmin", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 6,
      name: "Other SubAdmin",
      role: role_enum.SubAdmin,
      user_roles: [{ role: role_enum.SubAdmin, portal: portal_enum.store }],
    });
    (userManagementService.hashPassword as jest.Mock).mockResolvedValue("hashed_subadmin_pass");
    (userManagementService.updatePassword as jest.Mock).mockResolvedValue(undefined);

    const req: any = {
      params: { userId: "6" },
      body: { password: "subadminNewPassword123" },
      user: { userId: 5, roles: [{ role: role_enum.SubAdmin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(userManagementService.updatePassword).toHaveBeenCalledWith(6, "hashed_subadmin_pass");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("FORBIDS SubAdmin from resetting password for an Admin account", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Super Admin",
      role: role_enum.Admin,
      user_roles: [{ role: role_enum.Admin, portal: portal_enum.store }],
    });

    const req: any = {
      params: { userId: "1" },
      body: { password: "attemptedNewPass123" },
      user: { userId: 5, roles: [{ role: role_enum.SubAdmin, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    expect(next.mock.calls[0][0].message).toBe("Sub-admins cannot reset passwords for admin accounts");
    expect(userManagementService.updatePassword).not.toHaveBeenCalled();
  });

  it("FORBIDS unauthorized roles (e.g. Moderator) from resetting passwords", async () => {
    (userManagementService.findUserById as jest.Mock).mockResolvedValue({
      id: 15,
      name: "Student User",
      role: role_enum.Student,
      user_roles: [{ role: role_enum.Student, portal: portal_enum.store }],
    });

    const req: any = {
      params: { userId: "15" },
      body: { password: "somePassword123" },
      user: { userId: 8, roles: [{ role: role_enum.Moderator, portal: portal_enum.store }] },
    };
    const res = createRes();
    const next = jest.fn();

    await adminController.resetUserPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    expect(userManagementService.updatePassword).not.toHaveBeenCalled();
  });
});
