"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/components/layout/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[272px] flex-col border-r border-[rgba(17,25,24,0.08)] bg-[rgba(243,236,223,0.8)] px-6 py-8 backdrop-blur-[2px] lg:flex">
      <Link href="/dashboard" className="pb-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--accent-teal)]">
          Pointers Picks
        </p>
        <h1 className="mt-3 text-[2.25rem] leading-[0.95] font-semibold tracking-[-0.05em] text-slate-950">
          NBA desk
        </h1>
        <p className="mt-3 max-w-[14rem] text-sm leading-6 text-[var(--text-muted)]">
          Live NBA coverage with sharper routes into games, teams, props, and feed health.
        </p>
      </Link>

      <div className="border-t border-[var(--border-soft)] pt-6">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-soft)]">
          Coverage
        </p>
      </div>
      <nav className="mt-3 flex flex-col gap-1.5">
        {primaryNavigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group rounded-[20px] px-4 py-3.5 text-sm font-semibold transition duration-150 ${
                active
                  ? "border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.94)] text-slate-950 shadow-[0_10px_20px_rgba(17,25,24,0.045)]"
                  : "border border-transparent text-[var(--text-muted)] hover:border-[rgba(17,25,24,0.08)] hover:bg-[rgba(255,252,247,0.7)] hover:text-slate-950"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{item.label}</span>
                <span
                  className={`h-5 w-1 rounded-full transition ${
                    active ? "bg-[var(--accent-teal)]" : "bg-transparent group-hover:bg-[rgba(17,25,24,0.14)]"
                  }`}
                />
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[30px] border border-[rgba(17,25,24,0.08)] bg-[rgba(255,252,247,0.84)] p-5 shadow-[0_10px_20px_rgba(17,25,24,0.04)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--text-soft)]">
          Coverage note
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Built to stay readable on single-game nights, full boards, and partial feed coverage.
        </p>
      </div>
    </aside>
  );
}
