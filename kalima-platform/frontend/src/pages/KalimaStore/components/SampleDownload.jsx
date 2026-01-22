import React from "react";

const SampleDownload = ({ sample, title, type, isRTL }) => {
  if (!sample) return null;
  return (
    <div className="sample-download">
      <a href={sample} className="btn btn-outline" download>
        Download sample for {title}
      </a>
    </div>
  );
};

export default SampleDownload;
