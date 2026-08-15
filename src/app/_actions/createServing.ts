"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrders } from "./getOrders";

export async function createServing(orderId: string) {
  const { Order } = await prisma.serving.create({
    data: { orderId },
    select: { Order: { select: { year: true } } },
  });

  revalidatePath("/order-history");
  return getOrders(Order.year);
}
