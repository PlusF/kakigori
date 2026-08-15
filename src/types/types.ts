import type {
  MenuItemModel,
  OptionModel,
  YearModel,
} from "@/generated/prisma/models";
import type { Prisma } from "@/generated/prisma/client";

export type MenuItem = MenuItemModel;
export type Option = OptionModel;
export type Year = YearModel;

export type MenuOption = Option & { isDefault: boolean };

/** 選択可能なオプションを平坦化したメニュー */
export type MenuItemWithOptions = MenuItem & {
  options: MenuOption[];
};

export const defaultOptions = (menuItem: MenuItemWithOptions) =>
  menuItem.options.filter((option) => option.isDefault);

export const defaultOptionIds = (menuItem: MenuItemWithOptions) =>
  defaultOptions(menuItem).map(({ id }) => id);

/** 管理ページは無効にしたものも編集できる必要があるので isActive で絞らない */
export type AdminMenu = {
  menuItems: MenuItemWithOptions[];
  options: Option[];
};

/** id が null なら新規作成 */
export type MenuItemInput = {
  id: string | null;
  name: string;
  price: number;
  image: string;
  targetQuantity: number;
  sortOrder: number;
  isActive: boolean;
  options: { optionId: string; isDefault: boolean }[];
};

export type OptionInput = {
  id: string | null;
  name: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
};

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    OrderItem: {
      include: {
        MenuItem: true;
        OrderItemOption: { include: { Option: true } };
      };
    };
    Serving: true;
  };
}>;

/**
 * 更新系 Server Action の戻り値。
 * 例外を投げると必ず 500 になり、本番では文言もクライアントに渡らないため、
 * 会計確定済みのような想定内の失敗は戻り値で返す
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; message: string };

/** 注文確定前のカート行。同一メニューでもオプションが違えば別行になる */
export type CartItem = {
  key: string;
  menuItem: MenuItemWithOptions;
  options: Option[];
  quantity: number;
};

export type OrderInput = {
  menuItemId: string;
  quantity: number;
  optionIds: string[];
};

export const unitPrice = (price: number, options: { price: number }[]) =>
  options.reduce((acc, option) => acc + option.price, price);

export const cartItemKey = (menuItemId: string, optionIds: string[]) =>
  [menuItemId, ...[...optionIds].sort()].join(":");
