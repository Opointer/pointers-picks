"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNavigation } from "@/components/layout/navigation";
import { StatusChip } from "@/components/shared/status-chip";
import { type PlatformStatusViewModel } from "@/lib/view-models/platform-status";

export function TopUtilityBar({ status }: { status: PlatformStatusViewModel }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeItem = primaryNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="mb-10 flex flex-col gap-3 lg:mb-12">
      <div className="flex flex-col gap-3 rounded-[26px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.88)] px-4 py-4 shadow-[var(--shadow-subtle)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.34em] text-[var(--text-soft)]">
              {activeItem?.label ?? "Dashboard"}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
              {status.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.14em] text-[var(--foreground-strong)] transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-subtle)] lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          <StatusChip label={status.providerChip.label} tone={status.providerChip.tone} />
          <StatusChip label={status.freshnessChip.label} tone={status.freshnessChip.tone} />
          <StatusChip label={status.fallbackChip.label} tone={status.fallbackChip.tone} />
        </div>
      </div>

      {open ? (
        <div className="rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,253,249,0.96)] p-3 shadow-[var(--shadow-soft)] lg:hidden">
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
                  className={`rounded-[18px] px-4 py-3 text-sm font-bold tracking-[-0.02em] transition ${
                    active
                      ? "bg-[var(--surface-contrast)] text-white"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
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
