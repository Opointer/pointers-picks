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
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
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

  if (state === "empty") {
    return (
      <EmptyState
        title={emptyTitle ?? "No rows to show"}
        description={
          emptyDescription ??
          "Use the empty state when a table has no rows but the page still needs to feel intentional."
        }
      />
    );
  }

  if (state === "error") {
    return (
      <ErrorState
        title={errorTitle ?? "Table unavailable"}
        description={
          errorDescription ??
          "Use the visual-only error state when a table cannot render safely."
        }
      />
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle ?? "No rows to show"}
        description={
          emptyDescription ??
          "Use the empty state when a table has no rows but the page still needs to feel intentional."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[rgba(17,25,24,0.08)] bg-[var(--surface-strong)] shadow-[0_6px_16px_rgba(17,25,24,0.03)]">
      <table className="min-w-full text-left">
        <thead className="bg-[linear-gradient(180deg,#fbf6ee,#f2e8da)] text-[10px] uppercase tracking-[0.32em] text-[var(--text-soft)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-6 py-4 font-semibold ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={getRowKey ? getRowKey(row, index) : `${index}`}
              className="border-t border-[var(--border-soft)] text-sm text-slate-700 transition hover:bg-[rgba(246,240,230,0.55)]"
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
