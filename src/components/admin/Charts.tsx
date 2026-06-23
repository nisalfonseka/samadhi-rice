/* Bespoke, dependency-free SVG charts tuned to the SamadhiRice palette. */

export function AreaChart({
  data,
  color = "var(--color-paddy-600)",
  height = 150,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 600;
  const h = height;
  const pad = 10;
  const max = Math.max(1, ...data);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map(
    (v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)] as const,
  );
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const area =
    pts.length > 0
      ? `${line} L ${(pad + (data.length - 1) * step).toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`
      : "";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  color = "var(--color-harvest-500)",
  height = 150,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 600;
  const h = height;
  const pad = 10;
  const max = Math.max(1, ...data);
  const n = data.length || 1;
  const slot = (w - pad * 2) / n;
  const bw = Math.max(2, slot * 0.6);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        const x = pad + i * slot + (slot - bw) / 2;
        return (
          <rect
            key={i}
            x={x}
            y={h - pad - bh}
            width={bw}
            height={bh}
            rx="2.5"
            fill={color}
            opacity={0.55 + 0.45 * (v / max)}
          />
        );
      })}
    </svg>
  );
}

export function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-rice-200)" strokeWidth="14" />
        {segments.map((s, i, arr) => {
          const offset = arr.slice(0, i).reduce((sum, x) => sum + (x.value / total) * c, 0);
          const len = (s.value / total) * c;
          return (
            <circle
              key={s.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-husk-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="capitalize text-husk">{s.label.toLowerCase()}</span>
            <span className="ml-1">· {s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
