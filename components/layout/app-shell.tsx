import { type ReactNode } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopUtilityBar } from "@/components/layout/top-utility-bar";
import { getPlatformStatusViewModel } from "@/lib/view-models/platform-status";

export async function AppShell({ children }: { children: ReactNode }) {
  const status = await getPlatformStatusViewModel();

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[26rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,91,87,0.24),transparent)]" />
      <div className="pointer-events-none fixed right-0 top-0 h-[32rem] w-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(15,91,87,0.08),transparent_60%)]" />
      <SidebarNav />
      <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col">
          <TopUtilityBar status={status} />
          <main className="flex w-full flex-col gap-10 pb-10 lg:gap-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
