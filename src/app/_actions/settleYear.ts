"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { revalidatePath } from "next/cache";
import { getYears } from "./getYears";

export async function settleYear(year: number) {
  assertYear(year);

  await prisma.year.update({
    where: { year, settledAt: null },
    data: { settledAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return getYears();
}
