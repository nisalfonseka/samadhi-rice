import Link from "next/link";
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Join the harvest"
      subtitle="Create an account to save addresses and track every order."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-paddy-700 hover:text-paddy-900">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
