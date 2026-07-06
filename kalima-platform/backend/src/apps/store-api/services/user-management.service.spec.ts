jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("./account-review.service", () => ({
  accountReviewService: {
    roleRequiresReview: jest.fn().mockResolvedValue(false),
  },
}));

import UserManagementService from "./user-management.service";

describe("UserManagementService teacher serial generation", () => {
  it("ignores malformed matching serials and applies retry offsets", async () => {
    const db: any = {
      subjects: {
        findUnique: jest.fn().mockResolvedValue({ title: "Math" }),
      },
      teachers: {
        findMany: jest.fn().mockResolvedValue([
          { serial: "MA001" },
          { serial: "MA009" },
          { serial: "MABAD" },
        ]),
      },
    };
    const service = new UserManagementService(db);

    await expect(service.generateTeacherSerial(7)).resolves.toBe("MA010");
    await expect(service.generateTeacherSerial(7, 2)).resolves.toBe("MA012");
  });

  it("retries teacher creation when the generated teacher serial collides", async () => {
    const createdUser = { id: 55, name: "Teacher" };
    const db: any = {
      subjects: {
        findUnique: jest.fn().mockResolvedValue({ title: "Biology" }),
      },
      teachers: {
        findMany: jest.fn().mockResolvedValue([{ serial: "BI001" }]),
      },
      users: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockRejectedValueOnce({
            message: "UniqueConstraintViolation on teachers serial",
            meta: { target: "teachers_serial_key" },
          })
          .mockResolvedValueOnce(createdUser),
      },
      $transaction: jest.fn((callback: any) => callback(db)),
    };
    const service = new UserManagementService(db);

    await expect(
      service.createTeacher({
        name: "Teacher",
        email: "teacher@example.com",
        password: "Password123!",
        phone: "+201011111111",
        gender: "male" as any,
        is_primary: true,
        is_preparatory: false,
        is_secondary: false,
        government_id: 1,
        zone_id: 1,
        subject_id: 7,
      }),
    ).resolves.toEqual({ user: createdUser, email: "teacher@example.com" });

    expect(db.users.create).toHaveBeenCalledTimes(2);
    expect(db.users.create.mock.calls[0][0].data.teachers.create.serial).toBe("BI002");
    expect(db.users.create.mock.calls[1][0].data.teachers.create.serial).toBe("BI003");
  });
});
