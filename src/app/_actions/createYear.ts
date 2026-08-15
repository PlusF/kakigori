"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { ActionResult, Year } from "@/types/types";
import { getYears } from "./getYears";

/** メニューもオプションも持たないまっさらな年を作る */
export async function createYear(
  year: number,
  label: string
): Promise<ActionResult<Year[]>> {
  await assertAdmin();
  assertYear(year);

  if (await prisma.year.findUnique({ where: { year } })) {
    return { ok: false, message: `${year}年はすでにあります` };
  }

  await prisma.year.create({ data: { year, label: label || `${year}年` } });

  revalidatePath("/");
  return { ok: true, data: await getYears() };
}
