import { useTheme } from "./ThemeContext";

export default function Pagination({ current, totalPages, onPage }) {
  const { colors } = useTheme();
  
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(totalPages, current + delta);

  if (left > 1) pages.push(1);
  if (left > 2) pages.push("left-ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("right-ellipsis");
  if (right < totalPages) pages.push(totalPages);

  return (
    <div className="flex items-center justify-center mt-8 px-4 w-full overflow-x-auto">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* First button - hidden on mobile */}
        <button
          onClick={() => onPage(1)}
          disabled={current === 1}
          className={`hidden sm:flex px-2 sm:px-3 py-1 rounded-md ${colors.bg.secondary} hover:${colors.bg.hover} disabled:opacity-50 transition text-sm whitespace-nowrap ${colors.text.primary}`}
        >
          « First
        </button>
        
        {/* Prev button */}
        <button
          onClick={() => onPage(Math.max(1, current - 1))}
          disabled={current === 1}
          className={`px-2 sm:px-3 py-1 rounded-md ${colors.bg.secondary} hover:${colors.bg.hover} disabled:opacity-50 transition text-sm ${colors.text.primary}`}
        >
          ‹ Prev
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === "left-ellipsis" || p === "right-ellipsis" ? (
            <span key={p + idx} className={`px-1 sm:px-2 ${colors.text.muted}`}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`px-2 sm:px-3 py-1 rounded-md transition text-sm min-w-[32px] ${
                p === current 
                  ? `${colors.button.primary}` 
                  : `${colors.bg.secondary} hover:${colors.bg.hover} ${colors.text.primary}`
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPage(Math.min(totalPages, current + 1))}
          disabled={current === totalPages}
          className={`px-2 sm:px-3 py-1 rounded-md ${colors.bg.secondary} hover:${colors.bg.hover} disabled:opacity-50 transition text-sm ${colors.text.primary}`}
        >
          Next ›
        </button>
        
        {/* Last button - hidden on mobile */}
        <button
          onClick={() => onPage(totalPages)}
          disabled={current === totalPages}
          className={`hidden sm:flex px-2 sm:px-3 py-1 rounded-md ${colors.bg.secondary} hover:${colors.bg.hover} disabled:opacity-50 transition text-sm whitespace-nowrap ${colors.text.primary}`}
        >
          Last »
        </button>
      </div>
    </div>
  );
}