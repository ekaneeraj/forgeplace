import { ArrowRightIcon } from "@/components/atoms/icons";

function pageRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const withEllipsis: Array<number | "ellipsis"> = [];
  let prev = 0;
  for (const page of sorted) {
    if (page - prev > 1) withEllipsis.push("ellipsis");
    withEllipsis.push(page);
    prev = page;
  }
  return withEllipsis;
}

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  const baseBtn =
    "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${baseBtn} text-zinc-400 hover:bg-white/10 hover:text-zinc-100`}
        aria-label="Previous page"
      >
        <ArrowRightIcon className="size-4 rotate-180" />
      </button>

      {pageRange(current, total).map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-9 select-none items-center justify-center text-sm text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            aria-current={page === current ? "page" : undefined}
            className={`${baseBtn} ${
              page === current
                ? "bg-brand text-white"
                : "text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${baseBtn} text-zinc-400 hover:bg-white/10 hover:text-zinc-100`}
        aria-label="Next page"
      >
        <ArrowRightIcon className="size-4" />
      </button>
    </nav>
  );
}
