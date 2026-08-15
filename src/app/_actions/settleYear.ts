"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { revalidatePath } from "next/cache";
import { ActionResult, Year } from "@/types/types";
import { settledReason } from "./settledReason";
import { getYears } from "./getYears";

export async function settleYear(year: number): Promise<ActionResult<Year[]>> {
  assertYear(year);

  const reason = await settledReason(year);
  if (reason) {
    return { ok: false, message: reason };
  }

  await prisma.year.update({
    where: { year, settledAt: null },
    data: { settledAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return { ok: true, data: await getYears() };
}
