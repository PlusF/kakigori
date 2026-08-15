"use client";

import { createContext } from "react";

export const LoadingContext = createContext<{
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}>({
  loading: false,
  startLoading: () => {},
  stopLoading: () => {},
});
