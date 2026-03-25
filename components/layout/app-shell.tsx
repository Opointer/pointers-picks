import { type ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopUtilityBar } from "@/components/layout/top-utility-bar";
import { getPlatformStatusViewModel } from "@/lib/view-models/platform-status";

export async function AppShell({ children }: { children: ReactNode }) {
  const status = await getPlatformStatusViewModel();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#f3ecdf_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,253,249,0.84),rgba(255,253,249,0))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(10,85,96,0.28),transparent)]" />
      <div className="pointer-events-none fixed left-0 top-0 h-full w-[22rem] bg-[radial-gradient(circle_at_top_left,rgba(10,85,96,0.06),transparent_70%)]" />
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <TopUtilityBar status={status} />
          <main className="mx-auto flex w-full max-w-[1460px] flex-col gap-11 pb-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
