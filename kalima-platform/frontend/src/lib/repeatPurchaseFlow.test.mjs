import assert from "node:assert/strict";
import test from "node:test";
import {
  beginRepeatPurchaseCheck,
  confirmRepeatPurchase,
  dismissRepeatPurchase,
  emptyRepeatPurchaseState,
} from "./repeatPurchaseFlow.js";

test("submits immediately when preflight returns no repeated items", () => {
  const submission = new FormData();
  submission.append("notes", "Keep this form");

  const result = beginRepeatPurchaseCheck([], submission);

  assert.equal(result.shouldSubmit, true);
  assert.equal(result.submission, submission);
  assert.deepEqual(result.state, emptyRepeatPurchaseState);
});

test("stores the validated submission and repeated titles until confirmation", () => {
  const submission = new FormData();
  submission.append("notes", "Keep this form");
  const repeatedItems = [{ id: 10, title: "Arabic Workbook" }];

  const result = beginRepeatPurchaseCheck(repeatedItems, submission);

  assert.equal(result.shouldSubmit, false);
  assert.equal(result.state.pendingSubmission, submission);
  assert.deepEqual(result.state.items, repeatedItems);

  const confirmation = confirmRepeatPurchase(result.state);
  assert.equal(confirmation.submission, submission);
  assert.deepEqual(confirmation.state, emptyRepeatPurchaseState);
});

test("go back clears the warning without returning a submission", () => {
  const submission = new FormData();
  const state = beginRepeatPurchaseCheck(
    [{ id: 7, title: "Reading Skills" }],
    submission,
  ).state;

  const dismissed = dismissRepeatPurchase(state);

  assert.deepEqual(dismissed, emptyRepeatPurchaseState);
  assert.equal(dismissed.pendingSubmission, null);
});
