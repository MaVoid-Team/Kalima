import React from "react";

const Overlay = () => {
  // Minimal overlay component used by App; keep lightweight and non-intrusive
  return (
    <div aria-hidden="true" className="app-global-overlay pointer-events-none" />
  );
};

export default Overlay;
