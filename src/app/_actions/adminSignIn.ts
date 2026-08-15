"use server";

import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from "@/lib/admin";
import { ActionResult } from "@/types/types";

export async function adminSignIn(password: string): Promise<ActionResult> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { ok: false, message: "ADMIN_PASSWORD が設定されていません" };
  }
  if (password !== expected) {
    return { ok: false, message: "合言葉が違います" };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  });

  return { ok: true, data: null };
}
