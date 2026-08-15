"use client";

import { Stack, Title, useMantineTheme } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { getAdminMenu } from "../_actions/getAdminMenu";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext, isSettled } from "../_contexts/YearContext";
import { notifyError } from "../_components/notify";
import YearPanel from "./_components/YearPanel";
import OptionPanel from "./_components/OptionPanel";
import MenuPanel from "./_components/MenuPanel";
import { AdminMenu } from "@/types/types";

/** ナビゲーションからは辿れない。URL を直接開いて使う */
export default function Admin() {
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year, years } = useContext(YearContext);
  const [menu, setMenu] = useState<AdminMenu>({ menuItems: [], options: [] });
  const settled = isSettled(years, year);

  useEffect(() => {
    if (!year) return;

    (async () => {
      startLoading();
      try {
        setMenu(await getAdminMenu(year));
      } catch (error) {
        console.error("Failed to fetch admin menu:", error);
        notifyError("メニューの取得に失敗しました");
      } finally {
        stopLoading();
      }
    })();
  }, [startLoading, stopLoading, year]);

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        管理
      </Title>

      <YearPanel />
      <OptionPanel menu={menu} setMenu={setMenu} settled={settled} />
      <MenuPanel menu={menu} setMenu={setMenu} settled={settled} />
    </Stack>
  );
}
