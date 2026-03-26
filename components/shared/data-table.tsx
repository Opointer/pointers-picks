import { type ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { type ViewState } from "@/components/shared/view-state";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey?: (row: T, index: number) => string;
  state?: ViewState;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  state = "default",
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
}: DataTableProps<T>) {
  if (state === "loading") {
    return (
      <div className="overflow-hidden rounded-[26px] border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[var(--shadow-subtle)]">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.28em] text-[var(--text-soft)]">
          Loading table
        </div>
        <div className="animate-pulse divide-y divide-[var(--border-soft)]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid gap-4 px-6 py-4 md:grid-cols-3">
              <div className="h-4 rounded-full bg-slate-200" />
              <div className="h-4 rounded-full bg-slate-200" />
              <div className="h-4 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "empty" || !rows.length) {
    return (
      <EmptyState
        title={emptyTitle ?? "No rows to show"}
        description={emptyDescription ?? "There are no live rows to display in this table right now."}
      />
    );
  }

  if (state === "error") {
    return (
      <ErrorState
        title={errorTitle ?? "Table unavailable"}
        description={errorDescription ?? "This table could not render cleanly from the live feed."}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_10px_22px_rgba(16,23,23,0.04)]">
      <table className="min-w-full text-left">
        <thead className="bg-[linear-gradient(180deg,#fdfaf4,#f1e8da)] text-[10px] uppercase tracking-[0.34em] text-[var(--text-soft)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-6 py-4 font-extrabold ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={getRowKey ? getRowKey(row, index) : `${index}`}
              className="border-t border-[var(--border-soft)] text-sm text-slate-700 transition hover:bg-[rgba(242,234,223,0.48)]"
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-6 py-4 align-top leading-6 ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
