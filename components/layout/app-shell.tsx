import { type ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopUtilityBar } from "@/components/layout/top-utility-bar";
import { getPlatformStatusViewModel } from "@/lib/view-models/platform-status";

export async function AppShell({ children }: { children: ReactNode }) {
  const status = await getPlatformStatusViewModel();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1e8_0%,#f4efe7_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,252,247,0.82),rgba(255,252,247,0))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(13,92,99,0.28),transparent)]" />
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <TopUtilityBar status={status} />
          <main className="mx-auto flex w-full max-w-[1456px] flex-col gap-10 pb-14">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
