import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, OrderError } from "@/lib/services/order.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Name is too short").max(80),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  addressLine: z.string().trim().min(6, "Address is too short").max(300),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.literal("COD"),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        weight: z.number().int(),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const session = await auth();
    const { email, ...rest } = parsed.data;
    const order = await createOrder({
      ...rest,
      email: email || session?.user?.email || undefined,
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { orderNo: order.orderNo, total: order.total },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    console.error("[orders] create failed", e);
    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
