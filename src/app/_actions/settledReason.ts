import { prisma } from "@/lib/prisma";

/**
 * 会計確定済みの年に紐づくものは一切変更できない。
 * 確定済みなら理由の文言、変更できるなら null
 */
export async function settledReason(year: number) {
  const { settledAt } = await prisma.year.findUniqueOrThrow({
    where: { year },
    select: { settledAt: true },
  });

  return settledAt ? `${year}年は会計確定済みのため変更できません` : null;
}
