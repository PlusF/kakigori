"use client";

import {
  Title,
  Stack,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Image,
  useMantineTheme,
  Paper,
  Group,
} from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { getMenu } from "../_actions/getMenu";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext } from "../_contexts/YearContext";
import {
  MenuItemWithOptions,
  defaultOptions,
  unitPrice,
} from "@/types/types";

export default function Menu() {
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year } = useContext(YearContext);
  const [menuItems, setMenuItems] = useState<MenuItemWithOptions[]>([]);

  useEffect(() => {
    if (!year) return;

    (async () => {
      try {
        startLoading();
        setMenuItems(await getMenu(year));
      } catch (error) {
        console.error(error);
      } finally {
        stopLoading();
      }
    })();
  }, [startLoading, stopLoading, year]);

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        メニュー
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {menuItems.map((menuItem) => (
          <Card
            key={menuItem.id}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
          >
            {menuItem.image && (
              <Card.Section>
                <Image
                  src={`/images/${menuItem.image}`}
                  height={160}
                  alt={menuItem.name}
                />
              </Card.Section>
            )}

            <Stack gap="sm" mt={menuItem.image ? "md" : 0}>
              <Group justify="space-between">
                <Text size="sm">{menuItem.name}</Text>

                <Badge color={theme.primaryColor} size="md">
                  {unitPrice(menuItem.price, defaultOptions(menuItem))}円
                </Badge>
              </Group>

              {menuItem.options.length > 0 && (
                <Group gap="xs">
                  {menuItem.options.map((option) => (
                    <Badge
                      key={option.id}
                      color="gray"
                      variant={option.isDefault ? "light" : "outline"}
                      size="sm"
                    >
                      {option.name} +{option.price}円
                      {option.isDefault && "（標準）"}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {menuItems.length === 0 && (
        <Paper p="xl" withBorder>
          <Text ta="center" c="dimmed">
            メニューアイテムがありません
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
