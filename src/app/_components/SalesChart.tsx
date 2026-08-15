"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { Paper, Stack, Title, Text, Group, Select } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { getOrders } from "@/app/_actions/getOrders";
import { YearContext } from "@/app/_contexts/YearContext";
import { OrderWithItems } from "@/types/types";

const OPEN_HOUR = 11;
const CLOSE_HOUR = 21;

export function SalesChart() {
  const { year } = useContext(YearContext);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!year) return;

    (async () => {
      setLoading(true);
      try {
        setOrders(await getOrders(year));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [year]);

  // 開催日はその年の注文実績から導出する
  const dateOptions = useMemo(() => {
    const dates = new Set(
      orders.map((order) => dayjs(order.createdAt).format("YYYY-MM-DD"))
    );
    return [...dates]
      .sort()
      .map((date) => ({ value: date, label: dayjs(date).format("M月D日") }));
  }, [orders]);

  // 年を切り替えると選択中の日付が候補から外れるため、都度有効な日付に落とす
  const activeDate =
    selectedDate && dateOptions.some((option) => option.value === selectedDate)
      ? selectedDate
      : (dateOptions.at(-1)?.value ?? null);

  const chartData = useMemo(() => {
    if (!activeDate) return [];

    const intervals: Record<string, number> = {};
    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        intervals[dayjs().hour(hour).minute(minute).format("HH:mm")] = 0;
      }
    }

    orders
      .filter(
        (order) => dayjs(order.createdAt).format("YYYY-MM-DD") === activeDate
      )
      .forEach((order) => {
        const orderDate = dayjs(order.createdAt);
        const timeKey = orderDate
          .minute(Math.floor(orderDate.minute() / 30) * 30)
          .format("HH:mm");
        if (intervals[timeKey] !== undefined) {
          intervals[timeKey] += 1;
        }
      });

    return Object.entries(intervals)
      .map(([time, orderCount]) => ({ time, orderCount }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [orders, activeDate]);

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3} size="h4">
            売上推移グラフ
          </Title>
          <Select
            value={activeDate}
            onChange={setSelectedDate}
            data={dateOptions}
            placeholder="日付を選択"
            allowDeselect={false}
            w={140}
          />
        </Group>

        {loading ? (
          <Text c="dimmed" ta="center" py="xl">
            データを読み込み中...
          </Text>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={1}
              />
              <YAxis
                label={{ value: "注文数", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value) => [`${value}件`, "注文数"]}
                labelFormatter={(label) => `時間: ${label}`}
              />
              <Bar
                dataKey="orderCount"
                fill="#339af0"
                name="注文数"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            この年のデータがありません
          </Text>
        )}

        <Text size="xs" c="dimmed" ta="center">
          30分ごとの注文数を表示 (営業時間: {OPEN_HOUR}:00 - {CLOSE_HOUR}:00)
        </Text>
      </Stack>
    </Paper>
  );
}
