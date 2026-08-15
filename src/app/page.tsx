"use client";

import {
  Text,
  Title,
  Stack,
  Grid,
  Paper,
  Group,
  useMantineTheme,
  Progress,
  ThemeIcon,
  Badge,
  Button,
  Modal,
} from "@mantine/core";
import {
  IconCurrencyYen,
  IconShoppingCart,
  IconUsers,
  IconCashRegister,
} from "@tabler/icons-react";
import { useEffect, useState, useContext } from "react";
import { getOrders } from "@/app/_actions/getOrders";
import { getMenu } from "@/app/_actions/getMenu";
import { LoadingContext } from "@/app/_contexts/LoadingContext";
import { YearContext, isSettled } from "@/app/_contexts/YearContext";
import { settleYear } from "@/app/_actions/settleYear";
import { notifications } from "@mantine/notifications";
import { SalesChart } from "@/app/_components/SalesChart";
import { MenuItemWithOptions } from "@/types/types";

const TARGET_COLORS = ["pink", "blue", "grape", "teal", "orange", "indigo"];

export default function Home() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [popularItems, setPopularItems] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [optionCounts, setOptionCounts] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {}
  );
  const [menuItems, setMenuItems] = useState<MenuItemWithOptions[]>([]);
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year, years, setYears } = useContext(YearContext);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [settleModalOpened, setSettleModalOpened] = useState(false);
  const settled = isSettled(years, year);

  const handleSettleYear = async () => {
    if (!year) return;

    startLoading();
    try {
      setYears(await settleYear(year));
      setSettleModalOpened(false);
      notifications.show({
        title: "会計確定",
        message: `${year}年の会計を確定しました`,
        color: "green",
      });
    } catch (error) {
      console.error("Failed to settle year:", error);
      notifications.show({
        title: "エラー",
        message: "会計の確定に失敗しました",
        color: "red",
      });
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    if (!year) return;

    const fetchData = async () => {
      if (isInitialLoad) {
        startLoading();
      }
      try {
        const [orders, menu] = await Promise.all([
          getOrders(year),
          getMenu(year),
        ]);

        const itemQuantitiesCalc: Record<string, number> = {};
        const optionQuantitiesCalc: Record<string, number> = {};
        let totalSalesCalc = 0;
        let totalQuantityCalc = 0;

        orders.forEach((order) => {
          totalSalesCalc += order.total;
          order.OrderItem.forEach((item) => {
            const name = item.MenuItem.name;
            itemQuantitiesCalc[name] =
              (itemQuantitiesCalc[name] || 0) + item.quantity;
            totalQuantityCalc += item.quantity;

            item.OrderItemOption.forEach(({ Option }) => {
              optionQuantitiesCalc[Option.name] =
                (optionQuantitiesCalc[Option.name] || 0) + item.quantity;
            });
          });
        });

        const toRanking = (quantities: Record<string, number>) =>
          Object.entries(quantities)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);

        setTotalSales(totalSalesCalc);
        setTotalOrders(orders.length);
        setTotalQuantity(totalQuantityCalc);
        setPopularItems(toRanking(itemQuantitiesCalc).slice(0, 3));
        setOptionCounts(toRanking(optionQuantitiesCalc));
        setItemQuantities(itemQuantitiesCalc);
        setMenuItems(menu);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        if (isInitialLoad) {
          stopLoading();
          setIsInitialLoad(false);
        }
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [startLoading, stopLoading, isInitialLoad, year]);

  const stats = [
    {
      title: "総売り上げ",
      value: `${totalSales.toLocaleString()}円`,
      icon: IconCurrencyYen,
      color: "teal",
      description: "累計売上高",
    },
    {
      title: "注文数",
      value: `${totalOrders}件`,
      icon: IconShoppingCart,
      color: "blue",
      description: "累計注文件数",
    },
    {
      title: "販売個数",
      value: `${totalQuantity}個`,
      icon: IconUsers,
      color: "orange",
      description: "累計販売個数",
    },
  ];

  const targets = menuItems.filter((menuItem) => menuItem.targetQuantity > 0);

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={1} size="h1" c={theme.primaryColor}>
          ダッシュボード
        </Title>
        {settled ? (
          <Badge color="gray" size="lg" variant="light">
            {year}年 会計確定済み
          </Badge>
        ) : (
          <Button
            variant="light"
            radius="md"
            leftSection={<IconCashRegister size={18} />}
            onClick={() => setSettleModalOpened(true)}
            disabled={!year}
          >
            会計を確定
          </Button>
        )}
      </Group>

      <Modal
        opened={settleModalOpened}
        onClose={() => setSettleModalOpened(false)}
        title="会計を確定"
      >
        <Stack gap="md">
          <Text>
            {year}
            年の会計を確定します。確定するとこの年の注文・提供の記録を一切変更できなくなり、取り消しもできません。
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              radius="md"
              onClick={() => setSettleModalOpened(false)}
            >
              キャンセル
            </Button>
            <Button variant="filled" radius="md" onClick={handleSettleYear}>
              確定する
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Grid gap="md">
        {stats.map((stat) => (
          <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" tt="uppercase">
                  {stat.title}
                </Text>
                <ThemeIcon
                  color={stat.color}
                  variant="light"
                  size="lg"
                  radius="md"
                >
                  <stat.icon size={20} />
                </ThemeIcon>
              </Group>

              <Text size="xl">{stat.value}</Text>

              <Text size="xs" c="dimmed">
                {stat.description}
              </Text>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={3} size="h4">
                人気メニュー TOP3
              </Title>
              <Stack gap="xs">
                {popularItems.length > 0 ? (
                  popularItems.map((item, index) => (
                    <Group key={item.name} justify="space-between">
                      <Group gap="xs">
                        <Badge
                          color={
                            index === 0
                              ? "yellow"
                              : index === 1
                              ? "gray"
                              : "orange"
                          }
                          variant="filled"
                          size="sm"
                        >
                          {index + 1}
                        </Badge>
                        <Text size="sm">{item.name}</Text>
                      </Group>
                      <Text size="sm">{item.quantity}杯</Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    まだ注文がありません
                  </Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={3} size="h4">
                オプション別 注文数
              </Title>
              <Stack gap="xs">
                {optionCounts.length > 0 ? (
                  optionCounts.map((option) => (
                    <Group key={option.name} justify="space-between">
                      <Text size="sm">{option.name}</Text>
                      <Text size="sm">{option.quantity}個</Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    まだオプションの注文がありません
                  </Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {targets.length > 0 && (
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3} size="h4">
              商品別売上目標
            </Title>
            <Grid gap="md">
              {targets.map((menuItem, index) => {
                const sold = itemQuantities[menuItem.name] || 0;
                const percentage = Math.min(
                  Math.round((sold / menuItem.targetQuantity) * 100),
                  100
                );
                const color = TARGET_COLORS[index % TARGET_COLORS.length];
                return (
                  <Grid.Col
                    key={menuItem.id}
                    span={{ base: 12, sm: 6, md: 3 }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>
                          {menuItem.name}
                        </Text>
                        <Badge
                          color={percentage >= 100 ? "green" : color}
                          variant="light"
                          size="sm"
                        >
                          {percentage}%
                        </Badge>
                      </Group>
                      <Progress
                        value={percentage}
                        size="md"
                        radius="xl"
                        color={percentage >= 100 ? "green" : color}
                      />
                      <Text size="xs" c="dimmed">
                        {sold}杯 / 目標{menuItem.targetQuantity}杯
                      </Text>
                    </Stack>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Stack>
        </Paper>
      )}

      <SalesChart />
    </Stack>
  );
}
