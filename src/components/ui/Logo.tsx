import { cn } from "@/lib/utils";

/** Stylised paddy-ear mark — a small sheaf of rice grains on a stalk. */
function GrainMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 23V7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        {/* crown grain */}
        <path d="M12 3.2c1.5 1.1 1.5 3.5 0 4.6-1.5-1.1-1.5-3.5 0-4.6Z" />
        {/* three fanned pairs down the stalk */}
        <path d="M12 8.4c2.5-.3 4 1 4.2 3.1-2.1.3-3.8-.8-4.2-3.1Z" />
        <path d="M12 8.4c-2.5-.3-4 1-4.2 3.1 2.1.3 3.8-.8 4.2-3.1Z" />
        <path d="M12 12.6c2.3-.3 3.7 1 3.9 2.9-2 .3-3.5-.8-3.9-2.9Z" />
        <path d="M12 12.6c-2.3-.3-3.7 1-3.9 2.9 2 .3 3.5-.8 3.9-2.9Z" />
        <path d="M12 16.8c2 -.3 3.3 1 3.5 2.7-1.8.3-3.1-.7-3.5-2.7Z" />
        <path d="M12 16.8c-2 -.3-3.3 1-3.5 2.7 1.8.3 3.1-.7 3.5-2.7Z" />
      </g>
    </svg>
  );
}

export default function Logo({
  className,
  showTld = true,
}: {
  className?: string;
  showTld?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <GrainMark className="h-7 w-7 shrink-0 text-harvest-500" />
      <span className="font-display text-[1.4rem] font-semibold leading-none tracking-tight">
        Samadhi<span className="text-harvest-500">Rice</span>
        {showTld && (
          <span className="align-super text-[0.55em] font-normal opacity-60">
            .lk
          </span>
        )}
      </span>
    </span>
  );
}
