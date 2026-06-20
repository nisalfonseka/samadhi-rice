import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  showTld = true,
}: {
  className?: string;
  showTld?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Image
        src="/samadhiricelogo.svg"
        alt="Samadhi Rice logo"
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 object-contain"
        priority
      />
      <span className="font-display text-[1.4rem] font-semibold leading-none tracking-tight">
        Samadhi<span className="text-harvest-500">Rice</span>
        {showTld && (
          <span className="text-[0.55em] font-normal opacity-60">
            .lk
          </span>
        )}
      </span>
    </span>
  );
}