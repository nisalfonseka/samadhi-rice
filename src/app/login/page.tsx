import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to track orders and check out faster."
      footer={
        <>
          New to SamadhiRice?{" "}
          <Link href="/register" className="font-semibold text-paddy-700 hover:text-paddy-900">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
