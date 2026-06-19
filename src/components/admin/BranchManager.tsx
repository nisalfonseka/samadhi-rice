"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBranch, updateBranch, deleteBranch } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  hours: string | null;
  description: string | null;
  mapsUrl: string | null;
  images: string[];
};

/* ── image uploader ── */
function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "samadhirice/branches");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        setError("Upload failed — check Cloudinary credentials.");
        break;
      }
      const data = await res.json();
      newUrls.push(data.url);
    }
    onChange([...value, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <span className="block text-xs font-medium text-husk">Branch photos</span>

      {/* existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-husk/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
                  <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-px text-[0.6rem] text-white backdrop-blur-sm">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* upload zone */}
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors",
          uploading
            ? "border-paddy-400/40 bg-paddy-800/5 cursor-not-allowed"
            : "border-husk/15 hover:border-paddy-500/40 hover:bg-paddy-800/5",
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-paddy-600 border-t-transparent" />
            <span className="text-xs text-husk-soft">Uploading…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-husk/40" fill="none" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="text-center">
              <span className="text-xs font-medium text-paddy-700">Click to upload</span>
              <span className="text-xs text-husk/50"> or drag &amp; drop</span>
              <p className="mt-0.5 text-[0.68rem] text-husk/40">JPG, PNG, WebP · multiple allowed</p>
            </div>
          </>
        )}
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-[0.68rem] text-husk/40">
        Uploads go to Cloudinary. First image is used as the cover on the Branches page.
      </p>
    </div>
  );
}

/* ── branch form ── */
function BranchForm({
  branch,
  onDone,
  submitAction,
  submitLabel,
}: {
  branch?: Branch;
  onDone?: () => void;
  submitAction: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [pending, start] = useTransition();
  const [images, setImages] = useState<string[]>(branch?.images ?? []);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("images", JSON.stringify(images));
    start(async () => {
      await submitAction(fd);
      router.refresh();
      onDone?.();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk">Branch name *</span>
          <input name="name" required defaultValue={branch?.name} placeholder="Wattala Mill" className="ctrl text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk">City / Area *</span>
          <input name="city" required defaultValue={branch?.city} placeholder="Wattala, Western Province" className="ctrl text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-husk">Street address *</span>
        <input name="address" required defaultValue={branch?.address} placeholder="No. 42, Negombo Road" className="ctrl text-sm" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk">Phone</span>
          <input name="phone" type="tel" defaultValue={branch?.phone ?? ""} placeholder="+94 77 000 0000" className="ctrl text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-husk">Business hours</span>
          <input name="hours" defaultValue={branch?.hours ?? ""} placeholder="Mon–Sat · 8am–6pm" className="ctrl text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-husk">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={branch?.description ?? ""}
          placeholder="A short note about this branch — what makes it special, parking info, etc."
          className="ctrl resize-none text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-husk">Google Maps URL</span>
        <input name="mapsUrl" type="url" defaultValue={branch?.mapsUrl ?? ""} placeholder="https://maps.google.com/..." className="ctrl text-sm" />
      </label>

      {/* photo uploader */}
      <div className="rounded-xl border border-husk/10 bg-rice-100/60 p-3">
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-full bg-paddy-800 px-5 py-2 text-sm font-medium text-rice-50 transition-colors hover:bg-paddy-700",
            pending && "opacity-60",
          )}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-husk/15 px-5 py-2 text-sm font-medium text-husk hover:border-husk/30"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/* ── branch card ── */
function BranchCard({ branch }: { branch: Branch }) {
  const [editing, setEditing] = useState(false);
  const [delPending, startDel] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm(`Delete "${branch.name}"?`)) return;
    startDel(async () => {
      await deleteBranch(branch.id);
      router.refresh();
    });
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-paddy-600/30 bg-paddy-800/5 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-paddy-700">Editing — {branch.name}</p>
        <BranchForm
          branch={branch}
          submitAction={(fd) => updateBranch(branch.id, fd)}
          submitLabel="Save changes"
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  const imgs = branch.images ?? [];

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-husk/10 bg-rice-50 p-4">
      {/* image strip */}
      {imgs.length > 0 && (
        <div className="flex w-full gap-2 overflow-x-auto pb-1">
          {imgs.map((url, i) => (
            <div key={i} className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-husk/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/40 py-px text-center text-[0.55rem] text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-husk">{branch.name}</p>
        <p className="text-sm text-husk-soft">{branch.address}</p>
        <p className="text-sm text-husk-soft">{branch.city}</p>
        {branch.phone && <p className="text-sm text-husk-soft">{branch.phone}</p>}
        {branch.hours && <p className="text-xs text-husk/50">{branch.hours}</p>}
        {branch.mapsUrl && (
          <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-paddy-700 hover:underline">
            View on map →
          </a>
        )}
        {imgs.length > 0 && (
          <p className="text-xs text-paddy-600/70">{imgs.length} photo{imgs.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk transition-colors hover:border-paddy-600 hover:text-paddy-800"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={delPending}
          className="rounded-full border border-clay-400/30 px-3 py-1.5 text-xs font-medium text-clay-600 transition-colors hover:border-clay-500 hover:bg-clay-500 hover:text-rice-50 disabled:opacity-50"
        >
          {delPending ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

/* ── manager ── */
export default function BranchManager({ branches }: { branches: Branch[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {branches.length === 0 && !adding && (
        <p className="rounded-xl border border-dashed border-husk/15 px-4 py-6 text-center text-sm text-husk-soft">
          No branches yet. Add your first location below.
        </p>
      )}

      {branches.map((b) => (
        <BranchCard key={b.id} branch={b} />
      ))}

      {adding ? (
        <div className="rounded-2xl border border-paddy-600/30 bg-paddy-800/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-paddy-700">New branch</p>
          <BranchForm submitAction={createBranch} submitLabel="Add branch" onDone={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-husk/20 py-3 text-sm font-medium text-husk-soft transition-colors hover:border-paddy-600 hover:text-paddy-800"
        >
          <span className="text-lg leading-none">+</span> Add branch / location
        </button>
      )}
    </div>
  );
}
