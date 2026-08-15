"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { assertYearNotSettled } from "./assertYearNotSettled";
import { revalidatePath } from "next/cache";
import { OrderInput } from "@/types/types";
import { calcTotal } from "./calcTotal";

export async function createOrder(year: number, items: OrderInput[]) {
  assertYear(year);
  await assertYearNotSettled(year);

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
}
