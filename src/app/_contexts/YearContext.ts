"use client";

import { createContext } from "react";
import { Year } from "@/types/types";

/** year は年一覧の取得が終わるまで null */
export const YearContext = createContext<{
  year: number | null;
  years: Year[];
  setYear: (year: number) => void;
}>({
  year: null,
  years: [],
  setYear: () => {},
});
