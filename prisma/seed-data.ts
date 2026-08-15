export type YearSeed = {
  year: number;
  label: string;
  /** オプションはどのかき氷にも付けられる */
  options: { name: string; price: number }[];
  menuItems: {
    name: string;
    /** オプション無しの価格 */
    price: number;
    image: string;
    targetQuantity: number;
    /** 最初から選択済みにするオプション名 */
    defaultOptions?: string[];
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
        name: "いちご",
        price: 300,
        image: "strawberry.jpg",
        targetQuantity: 200,
      },
      {
        name: "ブルーハワイ",
        price: 300,
        image: "blue-hawaii.jpg",
        targetQuantity: 200,
      },
      {
        name: "レモンサワー",
        price: 500,
        image: "",
        targetQuantity: 100,
      },
      {
        // オレンジ込みで 600 円
        name: "カシスオレンジ",
        price: 500,
        image: "cassis.jpg",
        targetQuantity: 100,
        defaultOptions: ["オレンジ"],
      },
    ],
  },
];
