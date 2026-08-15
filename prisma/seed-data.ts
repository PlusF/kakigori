export type YearSeed = {
  year: number;
  label: string;
  options: { name: string; price: number }[];
  menuItems: {
    name: string;
    /** オプション無しの価格 */
    price: number;
    image: string;
    targetQuantity: number;
    options: { name: string; isDefault?: boolean }[];
  }[];
};

/** 年ごとのメニュー定義。新しい年はここに足すか `npm run new-year` で前年から複製する */
export const yearSeeds: YearSeed[] = [
  {
    year: 2026,
    label: "2026年",
    options: [
      { name: "練乳", price: 50 },
      { name: "オレンジ", price: 100 },
    ],
    menuItems: [
      {
        name: "初恋いちご",
        price: 300,
        image: "strawberry.jpg",
        targetQuantity: 200,
        options: [{ name: "練乳" }],
      },
      {
        name: "青春ブルーハワイ",
        price: 300,
        image: "blue-hawaii.jpg",
        targetQuantity: 200,
        options: [],
      },
      {
        name: "レモンサワー",
        price: 500,
        image: "",
        targetQuantity: 100,
        options: [],
      },
      {
        // オレンジ込みで 600 円
        name: "カシスオレンジ",
        price: 500,
        image: "cassis.jpg",
        targetQuantity: 100,
        options: [{ name: "オレンジ", isDefault: true }],
      },
    ],
  },
];
