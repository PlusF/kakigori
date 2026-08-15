"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { settledReason } from "./assertYearNotSettled";
import { revalidatePath } from "next/cache";
import { OrderInput } from "@/types/types";
import { calcTotal } from "./calcTotal";

/**
 * 確定済みの年への注文は利用者の操作ミスなので例外にしない。
 * Server Action の例外は必ず 500 になり、本番では文言もクライアントに渡らない
 */
export async function createOrder(
  year: number,
  items: OrderInput[]
): Promise<{ ok: true } | { ok: false; message: string }> {
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

  return { ok: true };
}
