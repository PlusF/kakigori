"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertYearNotSettled } from "./assertYearNotSettled";
import { getOrders } from "./getOrders";

export async function deleteOrder(orderId: string) {
  const { year } = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true },
  });
  await assertYearNotSettled(year);

  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return getOrders(year);
}
