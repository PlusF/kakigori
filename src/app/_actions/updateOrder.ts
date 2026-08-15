"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult, OrderInput, OrderWithItems } from "@/types/types";
import { settledReason } from "./settledReason";
import { calcTotal } from "./calcTotal";
import { getOrders } from "./getOrders";

export async function updateOrder(
  orderId: string,
  items: OrderInput[]
): Promise<ActionResult<OrderWithItems[]>> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { year: true },
  });

  const reason = await settledReason(order.year);
  if (reason) {
    return { ok: false, message: reason };
  }

  const total = await calcTotal(order.year, items);

  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId } }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        total,
        OrderItem: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            OrderItemOption: {
              create: item.optionIds.map((optionId) => ({ optionId })),
            },
          })),
        },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");
  return { ok: true, data: await getOrders(order.year) };
}
