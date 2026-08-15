import { prisma } from "@/lib/prisma";

/** 会計確定済みの年に紐づくものは一切変更できない */
export async function assertYearNotSettled(year: number) {
  const { settledAt } = await prisma.year.findUniqueOrThrow({
    where: { year },
    select: { settledAt: true },
  });

  if (settledAt) {
    throw new Error(`${year}年は会計確定済みのため変更できません`);
  }
}
