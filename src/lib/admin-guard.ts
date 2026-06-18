import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Returns the session only if the user is an admin, else null. */
export async function getAdminSession() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

/** For admin pages — redirects non-admins to login. */
export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  return session;
}

/** For server actions — throws so the mutation fails on non-admins. */
export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
