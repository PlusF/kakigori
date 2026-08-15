"use client";

import { Select } from "@mantine/core";
import { useContext } from "react";
import { YearContext } from "../_contexts/YearContext";

export default function YearSelect() {
  const { year, years, setYear } = useContext(YearContext);

  return (
    <Select
      value={year ? String(year) : null}
      onChange={(value) => value && setYear(Number(value))}
      data={years.map((y) => ({ value: String(y.year), label: y.label }))}
      placeholder="開催年"
      allowDeselect={false}
      w={160}
      size="sm"
    />
  );
}
