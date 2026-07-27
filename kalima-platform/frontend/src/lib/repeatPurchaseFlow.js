export const emptyRepeatPurchaseState = Object.freeze({
  items: [],
  pendingSubmission: null,
});

export function beginRepeatPurchaseCheck(items, submission) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      shouldSubmit: true,
      submission,
      state: emptyRepeatPurchaseState,
    };
  }

  return {
    shouldSubmit: false,
    submission: null,
    state: {
      items,
      pendingSubmission: submission,
    },
  };
}

export function confirmRepeatPurchase(state) {
  return {
    submission: state.pendingSubmission,
    state: emptyRepeatPurchaseState,
  };
}

export function dismissRepeatPurchase() {
  return emptyRepeatPurchaseState;
}
