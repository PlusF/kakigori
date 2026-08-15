"use client";

import { createContext } from "react";
import { Year } from "@/types/types";

/** year は年一覧の取得が終わるまで null */
export const YearContext = createContext<{
  year: number | null;
  years: Year[];
  setYear: (year: number) => void;
  setYears: (years: Year[]) => void;
}>({
  year: null,
  years: [],
  setYear: () => {},
  setYears: () => {},
});

/** 会計確定済みなら変更操作を受け付けない */
export const isSettled = (years: Year[], year: number | null) =>
  years.find((y) => y.year === year)?.settledAt != null;
