"use client";

import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Text,
  Title,
  Stack,
  Badge,
  Chip,
  NumberInput,
  Paper,
  Divider,
  ActionIcon,
  Grid,
  useMantineTheme,
} from "@mantine/core";
import {
  IconPlus,
  IconMinus,
  IconTrash,
  IconShoppingCart,
  IconHistory,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMenu } from "../_actions/getMenu";
import { createOrder } from "../_actions/createOrder";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext } from "../_contexts/YearContext";
import {
  CartItem,
  MenuItemWithOptions,
  cartItemKey,
  defaultOptionIds,
  unitPrice,
} from "@/types/types";

export default function OrderPage() {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year } = useContext(YearContext);
  const [menuItems, setMenuItems] = useState<MenuItemWithOptions[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  // カードごとに選択中のオプション。カートに入れるまでは確定しない
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const theme = useMantineTheme();
  const router = useRouter();

  const resetSelectedOptions = (items: MenuItemWithOptions[]) =>
    setSelectedOptions(
      Object.fromEntries(
        items.map((menuItem) => [menuItem.id, defaultOptionIds(menuItem)])
      )
    );

  useEffect(() => {
    if (!year) return;

    (async () => {
      try {
        startLoading();
        const menu = await getMenu(year);
        setMenuItems(menu);
        setCart([]);
        resetSelectedOptions(menu);
      } catch (error) {
        console.error(error);
      } finally {
        stopLoading();
      }
    })();
  }, [startLoading, stopLoading, year]);

  const handleAddItem = (menuItem: MenuItemWithOptions) => {
    const optionIds = selectedOptions[menuItem.id] ?? [];
    const key = cartItemKey(menuItem.id, optionIds);

    setCart((prev) =>
      prev.some((item) => item.key === key)
        ? prev.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...prev,
            {
              key,
              menuItem,
              options: menuItem.options.filter((option) =>
                optionIds.includes(option.id)
              ),
              quantity: 1,
            },
          ]
    );
  };

  const handleUpdateQuantity = (key: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.key !== key)
        : prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  };

  const totalAmount = cart.reduce(
    (acc, item) =>
      acc + unitPrice(item.menuItem.price, item.options) * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!year || cart.length === 0) return;

    startLoading();
    try {
      const result = await createOrder(
        year,
        cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          optionIds: item.options.map((option) => option.id),
        }))
      );
      if (!result.ok) {
        notifications.show({
          title: "エラー",
          message: result.message,
          color: "red",
        });
        return;
      }
      setCart([]);
      resetSelectedOptions(menuItems);
      router.refresh();
    } catch (error) {
      console.error("Failed to create order:", error);
      notifications.show({
        title: "エラー",
        message: "注文の登録に失敗しました",
        color: "red",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={1} size="h1" c={theme.primaryColor}>
          注文
        </Title>
        <Button
          component={Link}
          href="/order-history"
          variant="light"
          radius="md"
          leftSection={<IconHistory size={18} />}
        >
          注文履歴
        </Button>
      </Group>

      <Grid gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <Title order={2} size="h3">
              メニュー
            </Title>
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3 }}
              spacing="md"
              style={{ overflow: "visible" }}
            >
              {menuItems.map((menuItem) => {
                const optionIds = selectedOptions[menuItem.id] ?? [];
                const selected = menuItem.options.filter((option) =>
                  optionIds.includes(option.id)
                );
                const quantity = cart
                  .filter((item) => item.menuItem.id === menuItem.id)
                  .reduce((acc, item) => acc + item.quantity, 0);

                return (
                  <Card
                    key={menuItem.id}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease",
                      WebkitTapHighlightColor: "transparent",
                      position: "relative",
                      overflow: "visible",
                    }}
                    onClick={() => handleAddItem(menuItem)}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {quantity > 0 && (
                      <Badge
                        color="red"
                        size="lg"
                        circle
                        style={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          zIndex: 1,
                        }}
                      >
                        {quantity}
                      </Badge>
                    )}
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text size="sm">{menuItem.name}</Text>
                        <Badge
                          color={theme.primaryColor}
                          size="xs"
                          variant="outline"
                        >
                          {unitPrice(menuItem.price, selected)}円
                        </Badge>
                      </Group>

                      {menuItem.options.length > 0 && (
                        <Chip.Group
                          multiple
                          value={optionIds}
                          onChange={(value) =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [menuItem.id]: value,
                            }))
                          }
                        >
                          <Group
                            gap="xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {menuItem.options.map((option) => (
                              <Chip key={option.id} value={option.id} size="xs">
                                {option.name} +{option.price}円
                              </Chip>
                            ))}
                          </Group>
                        </Chip.Group>
                      )}
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="md" p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={2} size="h3">
                  カート
                </Title>
                <Badge size="lg" variant="filled" color={theme.primaryColor}>
                  {cart.length} 品
                </Badge>
              </Group>

              <Divider />

              {cart.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  カートは空です
                </Text>
              ) : (
                <Stack gap="sm">
                  {cart.map((item) => (
                    <Paper key={item.key} p="sm" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Text truncate>{item.menuItem.name}</Text>
                          {item.options.length > 0 && (
                            <Text size="xs" c="dimmed" truncate>
                              +{" "}
                              {item.options
                                .map((option) => option.name)
                                .join(" / ")}
                            </Text>
                          )}
                          <Text size="sm" c="dimmed">
                            {unitPrice(item.menuItem.price, item.options)}円 ×{" "}
                            {item.quantity}
                          </Text>
                        </Stack>
                        <Group gap="xs" wrap="nowrap">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            radius="md"
                            onClick={() =>
                              handleUpdateQuantity(item.key, item.quantity - 1)
                            }
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                          <NumberInput
                            value={item.quantity}
                            onChange={(value) =>
                              handleUpdateQuantity(item.key, Number(value))
                            }
                            min={1}
                            max={99}
                            w={30}
                            size="xs"
                            hideControls
                          />
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            radius="md"
                            onClick={() =>
                              handleUpdateQuantity(item.key, item.quantity + 1)
                            }
                          >
                            <IconPlus size={16} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="subtle"
                            radius="md"
                            onClick={() => handleUpdateQuantity(item.key, 0)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}

              <Divider />

              <Group justify="space-between">
                <Text size="lg">合計</Text>
                <Text size="xl" c={theme.primaryColor}>
                  {totalAmount.toLocaleString()}円
                </Text>
              </Group>

              <Button
                fullWidth
                size="lg"
                variant="filled"
                radius="md"
                leftSection={<IconShoppingCart size={20} />}
                onClick={handleSubmit}
                disabled={cart.length === 0}
              >
                注文を確定する
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
