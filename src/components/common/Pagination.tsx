import { Button } from "./Button";
import { IconChevronLeft, IconChevronRight } from "./icons";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      <p className="text-sm text-ink-soft">
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="px-2"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <IconChevronLeft size={16} />
        </Button>
        <span className="text-sm text-ink-soft">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="px-2"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <IconChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
