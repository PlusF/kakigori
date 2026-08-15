"use server";

import { prisma } from "@/lib/prisma";
import { OrderWithItems } from "@/types/types";

export async function getOrders(year: number): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { year },
    include: {
      OrderItem: {
        include: {
          MenuItem: true,
          OrderItemOption: { include: { Option: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
