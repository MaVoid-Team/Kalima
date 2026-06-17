import { appreciationController } from "./appreciation.controller";
import { appreciationService } from "../services/appreciation.service";
import { BadRequestError, ValidationError } from "../../../libs/errors";

jest.mock("../services/appreciation.service", () => ({
  appreciationService: {
    getAdminPage: jest.fn(),
    getOrCreateAdminPage: jest.fn(),
    getPublicPage: jest.fn(),
    createComment: jest.fn(),
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
});
