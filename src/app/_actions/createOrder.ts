"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { settledReason } from "./settledReason";
import { revalidatePath } from "next/cache";
import { ActionResult, OrderInput } from "@/types/types";
import { calcTotal } from "./calcTotal";

export async function createOrder(
  year: number,
  items: OrderInput[]
): Promise<ActionResult> {
  assertYear(year);

  const reason = await settledReason(year);
  if (reason) {
    return { ok: false, message: reason };
  }

  const total = await calcTotal(year, items);

  await prisma.order.create({
    data: {
      year,
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
  });

  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/order-history");

  return { ok: true, data: null };
}
