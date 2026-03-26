"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation } from "@/components/layout/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[rgba(244,239,231,0.92)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--accent-primary)]">
              NBA market desk
            </p>
            <div className="mt-1 flex items-end gap-3">
              <h1 className="ui-masthead text-[2.4rem] leading-none text-[var(--foreground-strong)] sm:text-[3rem]">
                Pointers Picks
              </h1>
              <span className="mb-1 hidden rounded-full border border-[rgba(15,91,87,0.14)] bg-[rgba(216,235,228,0.72)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-primary-strong)] sm:inline-flex">
                Live NBA
              </span>
            </div>
          </Link>

          <p className="max-w-[28rem] text-sm leading-6 text-[var(--text-muted)]">
            NBA games, props, teams, and player pages in one sharp board.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-4">
          {primaryNavigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative inline-flex items-center rounded-full px-4 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.16em] transition ${
                  active
                    ? "bg-[var(--surface-contrast)] text-white shadow-[var(--shadow-subtle)]"
                    : "text-[var(--text-muted)] hover:bg-[rgba(255,253,249,0.9)] hover:text-[var(--foreground-strong)]"
                }`}
              >
                {item.label}
                <span
                  className={`ml-2 h-1.5 w-1.5 rounded-full transition ${
                    active ? "bg-[var(--accent-gold-soft)]" : "bg-transparent group-hover:bg-[var(--accent-primary)]"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
