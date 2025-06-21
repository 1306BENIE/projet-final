import React from "react";

export const BookingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-200 w-full">
      {/* Left side: Image and details */}
      <div className="flex items-center gap-4 w-full md:w-2/3">
        <div className="bg-gray-200 w-16 h-16 rounded-full animate-pulse flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
      </div>

      {/* Right side: Status and buttons */}
      <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto mt-4 md:mt-0">
        <div className="h-6 bg-gray-200 rounded-full w-28 animate-pulse mb-2"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
