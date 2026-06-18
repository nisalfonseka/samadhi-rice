"use client";

import { useState } from "react";

export default function ImageUploader({
  name,
  initial,
}: {
  name: string;
  initial?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initial ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const signRes = await fetch("/api/admin/upload-sign", { method: "POST" });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Could not sign upload");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", String(sign.timestamp));
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);

      const up = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await up.json();
      if (!up.ok || !data.secure_url) {
        throw new Error(data.error?.message || "Upload failed");
      }
      setUrls((u) => [...u, data.secure_url as string]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Product"
              className="h-20 w-20 rounded-xl border border-husk/15 object-cover"
            />
            <button
              type="button"
              onClick={() => setUrls((u) => u.filter((x) => x !== url))}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-husk text-rice-50"
            >
              ×
            </button>
          </div>
        ))}
        <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-husk/30 text-2xl text-husk-soft transition-colors hover:border-paddy-600 hover:text-paddy-700">
          {uploading ? <span className="text-sm">…</span> : "+"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-clay-600">{error}</p>}
      <p className="mt-2 text-xs text-husk-soft">
        Optional. If no photo is set, the CSS rice-bag art is used.
      </p>
    </div>
  );
}
