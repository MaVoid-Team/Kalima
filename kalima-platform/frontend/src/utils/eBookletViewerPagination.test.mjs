import assert from "node:assert/strict";
import test from "node:test";

import { getViewerPageCount } from "./eBookletViewerPagination.js";

test("preview pagination uses the configured public preview count", () => {
  assert.equal(
    getViewerPageCount(
      {
        preview_page_count: 12,
        booklet_instance: { template_version: { page_count: 10 } },
      },
      true,
    ),
    12,
  );
});

test("non-preview pagination keeps using the authorized version page count", () => {
  assert.equal(
    getViewerPageCount(
      {
        preview_page_count: 12,
        booklet_instance: { template_version: { page_count: 24 } },
      },
      false,
    ),
    24,
  );
});

test("pagination falls back to one page for missing or invalid metadata", () => {
  assert.equal(getViewerPageCount({ preview_page_count: 0 }, true), 1);
  assert.equal(getViewerPageCount(null, true), 1);
});
