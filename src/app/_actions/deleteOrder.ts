"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, OrderWithItems } from "@/types/types";
import { settledReason } from "./settledReason";
import { getOrders } from "./getOrders";

export async function deleteOrder(
  orderId: string
): Promise<ActionResult<OrderWithItems[]>> {
  const { year } = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true },
  });

  const reason = await settledReason(year);
  if (reason) {
    return { ok: false, message: reason };
  }

  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return { ok: true, data: await getOrders(year) };
}
