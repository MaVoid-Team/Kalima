import React from 'react';

export default function LoadingSpinner({ className = "w-16 h-16 border-primary" }) {
  return (
    <div className="flex justify-center items-center h-screen px-4">
      <div className={"border-t-4 border-solid rounded-full animate-spin " + className} />
    </div>
  );
};

