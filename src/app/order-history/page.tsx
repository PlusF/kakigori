"use client";

import {
  Text,
  Title,
  Stack,
  Paper,
  Group,
  Badge,
  useMantineTheme,
  Card,
  Divider,
  Table,
  ActionIcon,
  Button,
  Modal,
  NumberInput,
} from "@mantine/core";
import { useState, useEffect, useContext } from "react";
import {
  IconShoppingCart,
  IconReceipt,
  IconEdit,
  IconTrash,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { getOrders } from "../_actions/getOrders";
import { updateOrder } from "../_actions/updateOrder";
import { deleteOrder } from "../_actions/deleteOrder";
import { createServing } from "../_actions/createServing";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext } from "../_contexts/YearContext";
import { OrderWithItems, unitPrice } from "@/types/types";

type OrderItem = OrderWithItems["OrderItem"][number];

const optionsOf = (item: OrderItem) =>
  item.OrderItemOption.map(({ Option }) => Option).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

const sortedItems = (items: OrderItem[]) =>
  [...items].sort((a, b) => a.MenuItem.sortOrder - b.MenuItem.sortOrder);

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const theme = useMantineTheme();
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const router = useRouter();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year } = useContext(YearContext);

  useEffect(() => {
    if (!year) return;

    let isInitial = true;

    const fetchOrders = async () => {
      if (isInitial) {
        startLoading();
      }
      try {
        setOrders(await getOrders(year));
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        if (isInitial) {
          stopLoading();
          isInitial = false;
        }
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [startLoading, stopLoading, year]);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTime = (date: Date | string) =>
    new Date(date).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleServe = async (order: OrderWithItems) => {
    startLoading();
    try {
      setOrders(await createServing(order.id));
    } catch (error) {
      console.error("Failed to record serving:", error);
      notifications.show({
        title: "エラー",
        message: "提供の記録に失敗しました",
        color: "red",
      });
    } finally {
      stopLoading();
    }
  };

  const handleEditClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setEditedItems(sortedItems(order.OrderItem));
    setEditModalOpened(true);
  };

  const handleDeleteClick = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setDeleteModalOpened(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    startLoading();
    try {
      const result = await updateOrder(
        selectedOrder.id,
        editedItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          optionIds: item.OrderItemOption.map(({ optionId }) => optionId),
        }))
      );
      setOrders(result);
      setEditModalOpened(false);
      notifications.show({
        title: "更新完了",
        message: "注文が更新されました",
        color: "green",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update order:", error);
      notifications.show({
        title: "エラー",
        message: "注文の更新に失敗しました",
        color: "red",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    startLoading();
    try {
      const result = await deleteOrder(selectedOrder.id);
      setOrders(result);
      setDeleteModalOpened(false);
      notifications.show({
        title: "削除完了",
        message: "注文が削除されました",
        color: "red",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete order:", error);
      notifications.show({
        title: "エラー",
        message: "注文の削除に失敗しました",
        color: "red",
      });
    } finally {
      stopLoading();
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setEditedItems((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        注文履歴
      </Title>

      {orders.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconShoppingCart size={48} color={theme.colors.gray[5]} />
            <Text c="dimmed" size="lg">
              まだ注文履歴がありません
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md">
          {orders.map((order, index) => (
            <Card
              key={order.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconReceipt
                      size={20}
                      color={theme.colors[theme.primaryColor][6]}
                    />
                    <Text size="lg">注文 #{orders.length - index}</Text>
                  </Group>
                  <Group gap="xs">
                    {order.Serving.map((serving) => (
                      <Badge key={serving.id} variant="light" color="green">
                        提供 {formatTime(serving.createdAt)}
                      </Badge>
                    ))}
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      radius="md"
                      leftSection={<IconToolsKitchen2 size={16} />}
                      onClick={() => handleServe(order)}
                    >
                      提供
                    </Button>
                    <Badge variant="light" color="blue">
                      {formatDate(order.createdAt)}
                    </Badge>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      radius="md"
                      onClick={() => handleEditClick(order)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      radius="md"
                      onClick={() => handleDeleteClick(order)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Divider />

                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>商品名</Table.Th>
                      <Table.Th>単価</Table.Th>
                      <Table.Th>数量</Table.Th>
                      <Table.Th>小計</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sortedItems(order.OrderItem).map((item) => {
                      const options = optionsOf(item);
                      const price = unitPrice(item.MenuItem.price, options);
                      return (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <Stack gap={2}>
                              <Text size="sm">{item.MenuItem.name}</Text>
                              {options.length > 0 && (
                                <Text size="xs" c="dimmed">
                                  +{" "}
                                  {options
                                    .map((option) => option.name)
                                    .join(" / ")}
                                </Text>
                              )}
                            </Stack>
                          </Table.Td>
                          <Table.Td>{price}円</Table.Td>
                          <Table.Td>{item.quantity}</Table.Td>
                          <Table.Td>
                            {(price * item.quantity).toLocaleString()}円
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>

                <Divider />

                <Group justify="space-between">
                  <Text size="lg">合計金額</Text>
                  <Text size="xl" c={theme.primaryColor}>
                    {order.total.toLocaleString()}円
                  </Text>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="注文を編集"
        size="lg"
      >
        {selectedOrder && editedItems.length > 0 && (
          <Stack gap="md">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>商品名</Table.Th>
                  <Table.Th>単価</Table.Th>
                  <Table.Th>数量</Table.Th>
                  <Table.Th>小計</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {editedItems.map((item) => {
                  const options = optionsOf(item);
                  const price = unitPrice(item.MenuItem.price, options);
                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm">{item.MenuItem.name}</Text>
                          {options.length > 0 && (
                            <Text size="xs" c="dimmed">
                              + {options.map((o) => o.name).join(" / ")}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>{price}円</Table.Td>
                      <Table.Td>
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) =>
                            updateItemQuantity(item.id, Number(value) || 0)
                          }
                          min={0}
                          max={99}
                          w={80}
                        />
                      </Table.Td>
                      <Table.Td>
                        {(price * item.quantity).toLocaleString()}円
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>

            <Divider />

            <Group justify="space-between">
              <Text size="lg">合計金額</Text>
              <Text size="xl" c={theme.primaryColor}>
                {editedItems
                  .reduce(
                    (acc, item) =>
                      acc +
                      unitPrice(item.MenuItem.price, optionsOf(item)) *
                        item.quantity,
                    0
                  )
                  .toLocaleString()}
                円
              </Text>
            </Group>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                radius="md"
                onClick={() => setEditModalOpened(false)}
              >
                キャンセル
              </Button>
              <Button variant="filled" radius="md" onClick={handleUpdateOrder}>
                更新
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="注文を削除"
      >
        <Stack gap="md">
          <Text>
            この注文を削除してもよろしいですか？この操作は取り消せません。
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              radius="md"
              onClick={() => setDeleteModalOpened(false)}
            >
              キャンセル
            </Button>
            <Button
              color="red"
              variant="filled"
              radius="md"
              onClick={handleDeleteOrder}
            >
              削除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
