import React from 'react';

export default function ItemLoading() {
  return (
    <div className="p-8 text-center text-gray-200 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4" />
      <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto" />
    </div>
  );
}
