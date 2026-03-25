"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { StatusChip } from "@/components/shared/status-chip";
import { primaryNavigation } from "@/components/layout/navigation";
import { type PlatformStatusViewModel } from "@/lib/view-models/platform-status";

export function TopUtilityBar({ status }: { status: PlatformStatusViewModel }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeItem = primaryNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="sticky top-0 z-20 mb-8 pt-1">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-[var(--border-soft)] bg-[rgba(255,252,247,0.94)] px-5 py-4 shadow-[var(--shadow-subtle)]">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-soft)]">
            {activeItem?.label ?? "Desk"}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {status.summary}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-wrap gap-2 lg:flex">
            <StatusChip label={status.providerChip.label} tone={status.providerChip.tone} />
            <StatusChip label={status.freshnessChip.label} tone={status.freshnessChip.tone} />
            <StatusChip label={status.fallbackChip.label} tone={status.fallbackChip.tone} />
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-slate-800 shadow-[var(--shadow-subtle)] transition hover:border-[var(--border-strong)] hover:bg-white lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-3 shadow-[var(--shadow-soft)] lg:hidden">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusChip label={status.providerChip.label} tone={status.providerChip.tone} />
            <StatusChip label={status.freshnessChip.label} tone={status.freshnessChip.tone} />
            <StatusChip label={status.fallbackChip.label} tone={status.fallbackChip.tone} />
          </div>
          <nav className="grid gap-2">
            {primaryNavigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border border-[var(--border-soft)] bg-[var(--surface-soft)] text-slate-950"
                      : "text-slate-700 hover:bg-[var(--surface-soft)] hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
