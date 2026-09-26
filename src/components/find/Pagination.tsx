import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start =
    (currentPage -
      1) *
      pageSize +
    1;

  const end =
    Math.min(
      currentPage *
        pageSize,
      totalItems,
    );

  const pages =
    Array.from(
      {
        length:
          totalPages,
      },
      (
        _,
        index,
      ) =>
        index + 1,
    );

  return (
    <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 sm:flex-row">

      <p className="text-sm text-slate-500">
        Showing{" "}
        <strong>
          {start}
        </strong>{" "}
        –{" "}
        <strong>
          {end}
        </strong>{" "}
        of{" "}
        <strong>
          {totalItems}
        </strong>
      </p>

      <div className="flex items-center gap-1">

        <button
          type="button"
          disabled={
            currentPage ===
            1
          }
          onClick={() =>
            onPageChange(
              currentPage -
                1,
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronLeft
            size={16}
          />
        </button>

        {pages.map(
          (
            page,
          ) => (
            <button
              key={
                page
              }
              type="button"
              onClick={() =>
                onPageChange(
                  page,
                )
              }
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${
                page ===
                currentPage
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage +
                1,
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronRight
            size={16}
          />
        </button>
      </div>
    </div>
  );
}
