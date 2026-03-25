"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/components/layout/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] flex-col border-r border-[var(--border-soft)] bg-[rgba(244,239,231,0.92)] px-6 py-8 lg:flex">
      <Link href="/dashboard" className="pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--accent-teal)]">
          Pointers Picks
        </p>
        <h1 className="mt-3 text-[2.05rem] leading-none font-semibold tracking-[-0.04em] text-slate-950">
          Daily desk
        </h1>
        <p className="mt-3 max-w-[14rem] text-sm leading-6 text-[var(--text-muted)]">
          Live NBA coverage with clean routes into games, teams, props, and feed status.
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
                  ? "border border-[var(--border-soft)] bg-[var(--surface-strong)] text-slate-950 shadow-[var(--shadow-subtle)]"
                  : "border border-transparent text-[var(--text-muted)] hover:border-[var(--border-soft)] hover:bg-[rgba(255,252,247,0.72)] hover:text-slate-950"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{item.label}</span>
                <span
                  className={`h-5 w-1 rounded-full transition ${
                    active ? "bg-[var(--accent-teal)]" : "bg-transparent group-hover:bg-[rgba(24,33,32,0.14)]"
                  }`}
                />
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,252,247,0.88)] p-5 shadow-[var(--shadow-subtle)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--text-soft)]">
          Desk note
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Built to stay readable on light, normal, and full NBA slates without losing feed context.
        </p>
      </div>
    </aside>
  );
}
