"use server";

import { prisma } from "@/lib/prisma";
import { assertYear } from "@/lib/assertYear";
import { OrderWithItems } from "@/types/types";

export async function getOrders(year: number): Promise<OrderWithItems[]> {
  assertYear(year);

  return prisma.order.findMany({
    where: { year },
    include: {
      OrderItem: {
        include: {
          MenuItem: true,
          OrderItemOption: { include: { Option: true } },
        },
      },
      Serving: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
