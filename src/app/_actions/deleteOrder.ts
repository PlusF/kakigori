"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function deleteOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true, settledAt: true },
  });
  if (order.settledAt) {
    throw new Error("会計確定済みの注文は削除できません");
  }

  await prisma.order.delete({ where: { id: orderId, settledAt: null } });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return getOrders(order.year);
}
