"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, OrderWithItems } from "@/types/types";
import { settledReason } from "./settledReason";
import { getOrders } from "./getOrders";

export async function setServing(
  orderId: string,
  served: boolean
): Promise<ActionResult<OrderWithItems[]>> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true, Serving: { select: { id: true } } },
  });

  const reason = await settledReason(order.year);
  if (reason) {
    return { ok: false, message: reason };
  }

  if (served && order.Serving.length === 0) {
    await prisma.serving.create({ data: { orderId } });
  } else if (!served) {
    await prisma.serving.deleteMany({ where: { orderId } });
  }

  revalidatePath("/order-history");
  return { ok: true, data: await getOrders(order.year) };
}
