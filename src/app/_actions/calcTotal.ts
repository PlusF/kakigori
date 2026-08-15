import { prisma } from "@/lib/prisma";
import { OrderInput, unitPrice } from "@/types/types";

/** DB 上の価格を正としてサーバー側で合計を計算し直す */
export async function calcTotal(year: number, items: OrderInput[]) {
  const [menuItems, options] = await Promise.all([
    prisma.menuItem.findMany({
      where: { year, id: { in: items.map((item) => item.menuItemId) } },
    }),
    prisma.option.findMany({
      where: { year, id: { in: items.flatMap((item) => item.optionIds) } },
    }),
  ]);

  return items.reduce((acc, item) => {
    const menuItem = menuItems.find(({ id }) => id === item.menuItemId);
    if (!menuItem) return acc;

    const selected = options.filter(({ id }) => item.optionIds.includes(id));
    return acc + unitPrice(menuItem.price, selected) * item.quantity;
  }, 0);
}
