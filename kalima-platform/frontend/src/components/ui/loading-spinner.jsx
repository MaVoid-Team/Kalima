import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen px-4">
      <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin" />
    </div>
  );
};

