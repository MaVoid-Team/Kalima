import assert from "node:assert/strict";
import test from "node:test";

import {
  getPageAfterRequiredFieldDelete,
  normalizeRequiredFieldsPagination,
  REQUIRED_FIELDS_PAGE_SIZE,
} from "./requiredFieldsPagination.js";

test("uses the backend total instead of the current page length", () => {
  assert.deepEqual(
    normalizeRequiredFieldsPagination(
      { results: 11, page: 2, limit: 10 },
      { page: 1, limit: REQUIRED_FIELDS_PAGE_SIZE },
    ),
    { total: 11, page: 2, limit: 10, pages: 2 },
  );
});

test("moves back one page after deleting its final row", () => {
  assert.equal(getPageAfterRequiredFieldDelete(2, 1), 1);
  assert.equal(getPageAfterRequiredFieldDelete(2, 2), 2);
  assert.equal(getPageAfterRequiredFieldDelete(1, 1), 1);
});
