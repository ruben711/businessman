"use client";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

export function TheorySection({ section, chapter }: { section: any; chapter: number }) {
  const mounted = useMounted();
  const key = `h${chapter}-${section.id}`;
  const read = useStore((s) => !!s.theoryProgress[key]?.read);
  const mark = useStore((s) => s.markTheoryRead);

  return (
    <section className="prose-dark">
      <h2>{section.title}</h2>
      {section.lead && <p className="!text-[16px] !text-ink-2 italic">{inline(section.lead)}</p>}
      {section.paragraphs?.map((p: string, i: number) => <p key={i}>{inline(p)}</p>)}
      {section.list && (
        <ul>
          {section.list.map((it: string, i: number) => <li key={i}>{inline(it)}</li>)}
        </ul>
      )}
      {section.subsections?.map((sub: any, i: number) => (
        <div key={i} className="mt-6 pl-4 border-l-2 border-acc/30">
          <h3>{sub.title}</h3>
          <p>{inline(sub.body)}</p>
        </div>
      ))}
      {section.callout && (
        <div className="panel p-4 mt-4 border-l-2 !border-l-acc">
          <div className="label mb-2">// OPMERKING</div>
          <p className="!mb-0 italic !text-[14px]">{inline(section.callout)}</p>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => mark(key)}
          disabled={!mounted || read}
          className={`btn btn-sm ${read ? "btn-primary opacity-60" : "btn-ghost"}`}
        >
          {read ? "✓ Gelezen" : "Markeer gelezen"}
        </button>
      </div>
    </section>
  );
}
