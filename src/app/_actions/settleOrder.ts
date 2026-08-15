"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function settleOrder(orderId: string) {
  const { year } = await prisma.order.update({
    where: { id: orderId, settledAt: null },
    data: { settledAt: new Date() },
    select: { year: true },
  });

  revalidatePath("/order-history");
  return getOrders(year);
}
