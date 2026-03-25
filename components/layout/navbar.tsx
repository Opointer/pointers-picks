import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Games" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/model", label: "Model" },
  { href: "/pointers-picks", label: "Pointers Picks" },
];

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-sm font-black tracking-[0.2em] text-slate-950">
            NBA
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              Sports Modeling
            </p>
            <p className="text-sm text-slate-300">Explainable Phase 1 MVP</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
