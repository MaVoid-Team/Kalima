import test from "node:test";
import assert from "node:assert/strict";
import { isGeneratedEBookletTitle, getEBookletDisplayTitle } from "./eBookletTitleUtils.js";

test("isGeneratedEBookletTitle detects various generated formats", () => {
  assert.equal(isGeneratedEBookletTitle("Teacher e-booklet #12"), true);
  assert.equal(isGeneratedEBookletTitle("teacher e-booklet #42"), true);
  assert.equal(isGeneratedEBookletTitle("e-booklet #5"), true);
  assert.equal(isGeneratedEBookletTitle("كتاب إلكتروني #10"), true);
  assert.equal(isGeneratedEBookletTitle("مذكرة إلكترونية #99"), true);
  assert.equal(isGeneratedEBookletTitle("Grade 5 Arabic Revision"), false);
  assert.equal(isGeneratedEBookletTitle(""), false);
  assert.equal(isGeneratedEBookletTitle(null), false);
});

test("getEBookletDisplayTitle prefers custom title over template title when custom is not generated", () => {
  const custom = {
    display_title: "Mr. Ahmed's Arabic Booklet",
    template: { title: "General Arabic Prep" },
  };
  assert.equal(getEBookletDisplayTitle(custom), "Mr. Ahmed's Arabic Booklet");
});

test("getEBookletDisplayTitle falls back to template title when display_title is generated placeholder", () => {
  const generated = {
    display_title: "Teacher e-booklet #10",
    template: { title: "Science Term 1" },
  };
  assert.equal(getEBookletDisplayTitle(generated), "Science Term 1");
});

test("getEBookletDisplayTitle handles wrapped booklet_instance and link objects", () => {
  const link = {
    booklet_instance: {
      display_title: "Teacher e-booklet #99",
      template: { title: "Math Advanced" },
    },
  };
  assert.equal(getEBookletDisplayTitle(link), "Math Advanced");
});

test("getEBookletDisplayTitle returns fallback when neither is available", () => {
  assert.equal(getEBookletDisplayTitle({}, "Default Fallback"), "Default Fallback");
  assert.equal(getEBookletDisplayTitle(null, "Fallback"), "Fallback");
});
