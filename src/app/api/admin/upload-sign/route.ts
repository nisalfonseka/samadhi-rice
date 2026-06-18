import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

/** Returns a short-lived signature so the admin can upload directly to
 *  Cloudinary without exposing the API secret to the browser. */
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const secret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!secret || !cloudName || !apiKey) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "samadhirice/products";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, secret);

  return NextResponse.json({ timestamp, folder, signature, apiKey, cloudName });
}
