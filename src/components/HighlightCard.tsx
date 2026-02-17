import { Highlight } from "@/lib/types";

const COLOR_CLASSES: Record<string, string> = {
  yellow: "border-l-yellow-400 bg-yellow-50",
  blue: "border-l-blue-400 bg-blue-50",
  pink: "border-l-pink-400 bg-pink-50",
  orange: "border-l-orange-400 bg-orange-50",
};

export default function HighlightCard({
  highlight,
}: {
  highlight: Highlight;
}) {
  const colorClass =
    (highlight.color && COLOR_CLASSES[highlight.color]) ||
    "border-l-stone-300 bg-white";

  return (
    <div className={`rounded-r-lg border-l-4 p-4 ${colorClass}`}>
      <blockquote className="text-stone-700 leading-relaxed">
        {highlight.text}
      </blockquote>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-400">
        {highlight.location && <span>{highlight.location}</span>}
        {highlight.color && (
          <span className="rounded-full bg-stone-200/60 px-2 py-0.5">
            {highlight.color}
          </span>
        )}
      </div>
      {highlight.note && (
        <p className="mt-3 rounded bg-white/60 px-3 py-2 text-sm text-stone-600 italic">
          {highlight.note}
        </p>
      )}
    </div>
  );
}
