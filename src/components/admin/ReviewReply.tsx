"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyReview } from "@/app/admin/actions";

export default function ReviewReply({
  id,
  initial,
}: {
  id: string;
  initial?: string | null;
}) {
  const [text, setText] = useState(initial ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a public reply…"
        className="ctrl !py-2 text-sm"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await replyReview(id, text);
            router.refresh();
          })
        }
        className="shrink-0 rounded-full bg-paddy-800 px-4 py-2 text-xs font-medium text-rice-50 hover:bg-paddy-900 disabled:opacity-50"
      >
        {pending ? "…" : "Save reply"}
      </button>
    </div>
  );
}
