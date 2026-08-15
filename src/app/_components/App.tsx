"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  Title,
  Burger,
  Container,
  LoadingOverlay,
  Group,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import YearSelect from "./YearSelect";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext } from "../_contexts/YearContext";
import { getYears } from "../_actions/getYears";
import { Year } from "@/types/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const theme = useMantineTheme();

  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0;
  const startLoading = useCallback(
    () => setLoadingCount((prev) => prev + 1),
    []
  );
  const stopLoading = useCallback(
    () => setLoadingCount((prev) => prev - 1),
    []
  );

  const [years, setYears] = useState<Year[]>([]);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getYears();
        setYears(data);
        setYear(data[0]?.year ?? null);
      } catch (error) {
        console.error("Failed to fetch years:", error);
      }
    })();
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      <YearContext.Provider value={{ year, years, setYear }}>
        <LoadingOverlay
          visible={loading}
          zIndex={9999}
          overlayProps={{ radius: "sm", blur: 2 }}
          pos="fixed"
          inset={0}
        />
        <AppShell
          padding="md"
          header={{ height: 60 }}
          navbar={{
            width: 200,
            breakpoint: "sm",
            collapsed: { mobile: !opened },
          }}
        >
          <AppShell.Header>
            <Group h="100%" px="md" justify="space-between" wrap="nowrap">
              <Group wrap="nowrap">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Title
                  order={1}
                  size="h2"
                  onClick={() => router.push("/")}
                  style={{
                    cursor: "pointer",
                    color: theme.colors[theme.primaryColor][6],
                    fontWeight: 700,
                  }}
                >
                  氷川かき氷
                </Title>
              </Group>
              <YearSelect />
            </Group>
          </AppShell.Header>

          <Navbar onNavigate={close} />

          <AppShell.Main>
            <Container size="lg" py="xl">
              {children}
            </Container>
          </AppShell.Main>
        </AppShell>
      </YearContext.Provider>
    </LoadingContext.Provider>
  );
}
