import { v2 as cloudinary } from "cloudinary";
import { assertAdmin } from "@/lib/admin-guard";

// CLOUDINARY_URL in .env is read automatically by the SDK on import.
// Calling config() a second time with split-out vars can produce a signature
// mismatch if any value is subtly different (whitespace, encoding, etc.).
// Only configure manually when CLOUDINARY_URL is absent.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(req: Request) {
  try {
    await assertAdmin();
  } catch {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = String(formData.get("folder") || "samadhirice/misc");

  if (!file || !file.size) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: "image" }, (err, res) => {
          if (err || !res) reject(err ?? new Error("Upload failed"));
          else resolve(res as { secure_url: string; public_id: string });
        })
        .end(buffer);
    },
  );

  return Response.json({ url: result.secure_url, publicId: result.public_id });
}
