import { appreciationController } from "./appreciation.controller";
import { appreciationService } from "../services/appreciation.service";
import { BadRequestError, ValidationError } from "../../../libs/errors";

jest.mock("../services/appreciation.service", () => ({
  appreciationService: {
    getAdminPage: jest.fn(),
    getOrCreateAdminPage: jest.fn(),
    getPublicPage: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

function createRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("appreciationController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid admin user ids", async () => {
    const req: any = { params: { userId: "abc" } };
    const res = createRes();
    const next = jest.fn();

    await appreciationController.getAdminPage(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it("rejects blank names, blank comments, and oversized payloads", async () => {
    const req: any = {
      params: { token: "public-token" },
      body: {
        authorName: "   ",
        comment: "x".repeat(1001),
      },
    };
    const res = createRes();
    const next = jest.fn();

    await appreciationController.createComment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(appreciationService.createComment).not.toHaveBeenCalled();
  });

  it("rejects invalid admin comment ids", async () => {
    const req: any = {
      params: { userId: "42", commentId: "abc" },
      body: { authorName: "Student", comment: "Edited" },
    };
    const res = createRes();
    const next = jest.fn();

    await appreciationController.updateComment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    expect(appreciationService.updateComment).not.toHaveBeenCalled();
  });

  it("validates admin comment edits before calling the service", async () => {
    const req: any = {
      params: { userId: "42", commentId: "3" },
      body: { authorName: "", comment: "" },
    };
    const res = createRes();
    const next = jest.fn();

    await appreciationController.updateComment(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(appreciationService.updateComment).not.toHaveBeenCalled();
  });

  it("forwards a valid admin edit and returns the updated comment", async () => {
    appreciationService.updateComment.mockResolvedValue({
      id: 3,
      authorName: "Student",
      comment: "Edited",
      createdAt: null,
    });
    const req: any = {
      params: { userId: "42", commentId: "3" },
      body: { authorName: "Student", comment: "Edited" },
    };
    const res = createRes();
    const next = jest.fn();

    await appreciationController.updateComment(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(appreciationService.updateComment).toHaveBeenCalledWith(42, 3, {
      authorName: "Student",
      comment: "Edited",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ id: 3 }),
    }));
  });
});
