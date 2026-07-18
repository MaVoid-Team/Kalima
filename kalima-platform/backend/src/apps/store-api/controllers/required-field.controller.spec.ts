import "reflect-metadata";
import { requiredFieldController } from "./required-field.controller";
import { requiredFieldService } from "../services/required-field.service";

jest.mock("../services/required-field.service", () => ({
  requiredFieldService: {
    getAllDefinitions: jest.fn(),
  },
}));

function createRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("requiredFieldController.getAllDefinitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the total and current pagination metadata", async () => {
    const definitions = [{ id: 11, label: "Field 11" }];
    (requiredFieldService.getAllDefinitions as jest.Mock).mockResolvedValue({
      data: definitions,
      page: 2,
      limit: 10,
      count: 11,
    });

    const req: any = {
      query: { page: "2", limit: "10", active: "true" },
    };
    const res = createRes();
    const next = jest.fn();

    await requiredFieldController.getAllDefinitions(req, res, next);

    expect(requiredFieldService.getAllDefinitions).toHaveBeenCalledWith({
      active: true,
      page: 2,
      limit: 10,
      search: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      results: 11,
      page: 2,
      limit: 10,
      data: definitions,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
