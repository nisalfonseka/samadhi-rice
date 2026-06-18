"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create your account.");
        setLoading(false);
        return;
      }
      // auto sign-in
      const signin = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signin?.error) {
        // account created but sign-in failed — send to login
        router.push("/login");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Full name</span>
        <input className="ctrl" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nimal Perera" autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Email</span>
        <input type="email" className="ctrl" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.lk" autoComplete="email" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Phone (optional)</span>
        <input className="ctrl" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07X XXX XXXX" autoComplete="tel" inputMode="tel" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Password</span>
        <input type="password" className="ctrl" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
      </label>

      {error && (
        <p className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-full py-3.5 font-medium text-rice-50 transition-all duration-300",
          loading ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900 hover:-translate-y-0.5",
        )}
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
