"use server";

import { prisma } from "@/lib/prisma";

export async function getYears() {
  return prisma.year.findMany({
    orderBy: { year: "desc" },
  });
}
