import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= halfVisible + 1) {
        // Near the beginning
        for (
          let i = 2;
          i <= Math.min(maxVisiblePages - 1, totalPages - 1);
          i++
        ) {
          pages.push(i);
        }
        if (totalPages > maxVisiblePages - 1) {
          pages.push("...");
        }
      } else if (currentPage >= totalPages - halfVisible) {
        // Near the end
        if (totalPages > maxVisiblePages - 1) {
          pages.push("...");
        }
        for (
          let i = Math.max(2, totalPages - maxVisiblePages + 2);
          i < totalPages;
          i++
        ) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (
          let i = currentPage - halfVisible + 1;
          i <= currentPage + halfVisible - 1;
          i++
        ) {
          pages.push(i);
        }
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Précédent
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-8 h-8 text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={`w-8 h-8 p-0 ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1"
      >
        Suivant
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
