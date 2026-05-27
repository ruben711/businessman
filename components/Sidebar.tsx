"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "▦" },
      { href: "/theorie", label: "Theorie", icon: "❡" },
      { href: "/oefeningen", label: "Oefeningen", icon: "▶" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/casussen", label: "Casussen", icon: "◆" },
      { href: "/examen", label: "Examen", icon: "◉" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/begrippen", label: "Begrippen", icon: "✦" },
      { href: "/glossarium", label: "Glossarium", icon: "❖" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/leaderboard", label: "Leaderboard", icon: "♛" },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => path === href || (href !== "/" && path?.startsWith(href + "/"));

  return (
    <aside className="w-[220px] shrink-0 bg-panel/40 border-r border-line/[0.06] flex flex-col sticky top-0 h-screen">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 px-5 h-[60px] border-b border-line/[0.06] hover:bg-hover/30 transition">
        <div className="relative w-7 h-7 grid grid-cols-3 grid-rows-3 gap-[1px]">
          {/* pixel logo */}
          {[1,1,0,1,1,1,0,1,1].map((v, i) => (
            <div key={i} className={v ? "bg-acc shadow-[0_0_4px_rgb(110_231_183/0.6)]" : "bg-transparent"} />
          ))}
        </div>
        <div className="leading-tight">
          <div className="font-pixel text-[10px] tracking-[0.1em] text-ink">BM·CONSOLE</div>
          <div className="font-pixel text-[7px] tracking-[0.14em] text-ink-3 mt-1">25–26 · v1</div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((s) => (
          <div key={s.label}>
            <div className="px-3 mb-2 font-pixel text-[8px] tracking-[0.18em] text-ink-4">{s.label}</div>
            <div className="space-y-[2px]">
              {s.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`sidebar-link ${isActive(it.href) ? "active" : ""}`}
                >
                  <span className="si">{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer status */}
      <div className="px-4 py-3 border-t border-line/[0.06]">
        <div className="flex items-center gap-2 text-[10px] text-ink-3">
          <span className="w-1.5 h-1.5 rounded-full bg-acc anim-pulse"></span>
          <span className="font-pixel text-[8px] tracking-[0.12em]">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
