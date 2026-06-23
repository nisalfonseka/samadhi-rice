"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  // The proxy can pass an absolute callbackUrl; normalise to a safe,
  // same-origin relative path so client navigation works.
  const callbackUrl = (() => {
    const raw = params.get("callbackUrl");
    if (!raw) return "/account";
    if (raw.startsWith("/")) return raw;
    try {
      const u = new URL(raw);
      if (typeof window !== "undefined" && u.origin === window.location.origin) {
        return u.pathname + u.search;
      }
    } catch {
      /* fall through */
    }
    return "/account";
  })();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    window.location.href = callbackUrl;
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Email</span>
        <input
          type="email"
          required
          className="ctrl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.lk"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-husk">Password</span>
        <input
          type="password"
          required
          className="ctrl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-full py-3.5 font-medium text-rice-50 transition-all duration-300",
          loading ? "bg-paddy-600" : "bg-paddy-800 hover:bg-paddy-900 hover:-translate-y-0.5",
        )}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
