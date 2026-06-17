/** Presentational CSS/SVG rice-bag art, coloured from a product's grain tones. */
export default function RiceBag({
  light,
  mid,
  dark,
  sinhala,
  id,
  className,
}: {
  light: string;
  mid: string;
  dark: string;
  sinhala?: string | null;
  id: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden>
      <defs>
        <linearGradient id={`bag-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="207" rx="62" ry="9" fill="rgba(34,31,23,0.18)" />
      <path d="M58 44c10-7 74-7 84 0l-6 12H64l-6-12Z" fill={dark} />
      <path d="M58 44c10-6 74-6 84 0-12 4-72 4-84 0Z" fill={light} opacity="0.5" />
      <path
        d="M64 56h72c6 28 9 92 4 132-2 14-12 18-40 18s-38-4-40-18c-5-40-2-104 4-132Z"
        fill={`url(#bag-${id})`}
      />
      <path d="M70 60c-5 40-6 96-2 130" stroke={light} strokeWidth="1.5" opacity="0.25" fill="none" />
      <path d="M130 60c5 40 6 96 2 130" stroke={dark} strokeWidth="2" opacity="0.4" fill="none" />
      <rect x="74" y="96" width="52" height="60" rx="8" fill={light} opacity="0.96" />
      <rect x="74" y="96" width="52" height="60" rx="8" fill="none" stroke={dark} strokeWidth="1" opacity="0.35" />
      {sinhala && (
        <text x="100" y="118" textAnchor="middle" className="font-[var(--font-sinhala)]" fontSize="13" fill={dark}>
          {sinhala}
        </text>
      )}
      <line x1="84" y1="126" x2="116" y2="126" stroke={dark} strokeWidth="1" opacity="0.3" />
      <text x="100" y="140" textAnchor="middle" fontSize="6.5" letterSpacing="1.5" fill={dark} opacity="0.85">
        SAMADHI RICE
      </text>
      <text x="100" y="150" textAnchor="middle" fontSize="4.6" letterSpacing="1" fill={dark} opacity="0.55">
        MILLED TO ORDER
      </text>
      <g fill={light} opacity="0.85">
        <ellipse cx="78" cy="182" rx="3" ry="1.4" transform="rotate(20 78 182)" />
        <ellipse cx="122" cy="186" rx="3" ry="1.4" transform="rotate(-25 122 186)" />
        <ellipse cx="100" cy="190" rx="3" ry="1.4" transform="rotate(8 100 190)" />
      </g>
    </svg>
  );
}
