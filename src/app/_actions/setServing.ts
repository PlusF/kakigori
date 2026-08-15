"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function setServing(orderId: string, served: boolean) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true, Serving: { select: { id: true } } },
  });

  if (served && order.Serving.length === 0) {
    await prisma.serving.create({ data: { orderId } });
  } else if (!served) {
    await prisma.serving.deleteMany({ where: { orderId } });
  }

  revalidatePath("/order-history");
  return getOrders(order.year);
}
