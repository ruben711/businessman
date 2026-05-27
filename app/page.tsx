import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="anim-in">
        <div className="eyebrow mb-4">// SESSION INIT · 25–26</div>
        <h1 className="text-[42px] md:text-[56px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
          Business Management <span className="text-acc">Console</span>
        </h1>
        <p className="text-[16px] text-ink-2 mt-4 max-w-[640px] leading-relaxed">
          Studieplatform voor zelfstandig ondernemen, vennootschapsvormen, financiering, verzekeringen,
          boekhouding, kostprijs en sociaal statuut. Speel je weg door zeven hoofdstukken.
        </p>
        <div className="flex gap-2 mt-8 flex-wrap">
          <Link href="/dashboard" className="btn btn-primary">▶ Continue</Link>
          <Link href="/theorie" className="btn">New Game</Link>
          <Link href="/leaderboard" className="btn btn-ghost">Leaderboard</Link>
        </div>
      </section>

      <div className="divider-strong" />

      <section className="grid md:grid-cols-3 gap-3">
        {[
          { t: "Theorie", d: "Per hoofdstuk doorlezen, voortgang per sectie", h: "/theorie", icon: "❡" },
          { t: "Oefeningen", d: "76 vragen — mc, waar/niet, open, invul, casus", h: "/oefeningen", icon: "▶" },
          { t: "Casussen", d: "Business-scenario's met stappenplan", h: "/casussen", icon: "◆" },
        ].map((c) => (
          <Link key={c.h} href={c.h} className="panel panel-hover p-5 group">
            <div className="flex items-start justify-between mb-4">
              <span className="text-acc text-[18px]">{c.icon}</span>
              <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
            </div>
            <div className="font-pixel text-[10px] tracking-[0.1em] text-ink mb-2">{c.t.toUpperCase()}</div>
            <p className="text-[13px] text-ink-2 leading-relaxed">{c.d}</p>
          </Link>
        ))}
      </section>

      <section className="panel p-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="eyebrow mb-2">// PRIVACY</div>
            <p className="text-[13px] text-ink-2 leading-relaxed">
              Voortgang wordt lokaal opgeslagen. Leaderboard toont enkel een geanonimiseerde naam.
              Geen analytics, geen tracking, geen verkoop van data — gemaakt voor studenten, door een student.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link href="/glossarium" className="btn btn-ghost btn-sm">Begrippen ↗</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
