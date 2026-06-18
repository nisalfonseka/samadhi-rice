"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "rounded-full border border-husk/20 px-5 py-2.5 text-sm font-medium text-husk transition-colors hover:border-clay-500 hover:text-clay-600"
      }
    >
      Sign out
    </button>
  );
}
