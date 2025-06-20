import { useState, useCallback } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialTotal?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToFirst: () => void;
  goToLast: () => void;
  reset: () => void;
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  initialTotal = 0,
}: UsePaginationOptions = {}): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const goToNext = useCallback(() => {
    if (hasNext) {
      setPage(page + 1);
    }
  }, [page, hasNext]);

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setPage(page - 1);
    }
  }, [page, hasPrev]);

  const goToFirst = useCallback(() => {
    setPage(1);
  }, []);

  const goToLast = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(initialTotal);
  }, [initialPage, initialLimit, initialTotal]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    setLimit,
    setTotal,
    goToPage,
    goToNext,
    goToPrev,
    goToFirst,
    goToLast,
    reset,
  };
};
