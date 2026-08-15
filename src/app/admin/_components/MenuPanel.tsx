"use client";

import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useContext, useState } from "react";
import { saveMenuItem } from "@/app/_actions/saveMenuItem";
import { LoadingContext } from "@/app/_contexts/LoadingContext";
import { YearContext } from "@/app/_contexts/YearContext";
import { notifyError } from "@/app/_components/notify";
import { AdminMenu, MenuItemInput, MenuItemWithOptions } from "@/types/types";

export default function MenuPanel({
  menu,
  setMenu,
  settled,
}: {
  menu: AdminMenu;
  setMenu: (menu: AdminMenu) => void;
  settled: boolean;
}) {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year } = useContext(YearContext);
  const [form, setForm] = useState<MenuItemInput | null>(null);

  const openNew = () =>
    setForm({
      id: null,
      name: "",
      price: 0,
      image: "",
      targetQuantity: 0,
      sortOrder: (menu.menuItems.at(-1)?.sortOrder ?? 0) + 1,
      isActive: true,
      options: [],
    });

  const openEdit = (menuItem: MenuItemWithOptions) =>
    setForm({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      targetQuantity: menuItem.targetQuantity,
      sortOrder: menuItem.sortOrder,
      isActive: menuItem.isActive,
      options: menuItem.options.map(({ id, isDefault }) => ({
        optionId: id,
        isDefault,
      })),
    });

  const toggleOption = (optionId: string, selected: boolean) => {
    if (!form) return;
    setForm({
      ...form,
      options: selected
        ? [...form.options, { optionId, isDefault: false }]
        : form.options.filter((option) => option.optionId !== optionId),
    });
  };

  const toggleDefault = (optionId: string, isDefault: boolean) => {
    if (!form) return;
    setForm({
      ...form,
      options: form.options.map((option) =>
        option.optionId === optionId ? { ...option, isDefault } : option
      ),
    });
  };

  const handleSave = async () => {
    if (!year || !form) return;

    startLoading();
    try {
      const result = await saveMenuItem(year, form);
      if (!result.ok) {
        notifyError(result.message);
        return;
      }
      setMenu(result.data);
      setForm(null);
    } catch (error) {
      console.error("Failed to save menu item:", error);
      notifyError("メニューの保存に失敗しました");
    } finally {
      stopLoading();
    }
  };

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2} size="h4">
            メニュー
          </Title>
          <Button
            variant="light"
            radius="md"
            onClick={openNew}
            disabled={!year || settled}
          >
            追加
          </Button>
        </Group>

        {menu.menuItems.length === 0 ? (
          <Text c="dimmed">メニューがありません</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>名前</Table.Th>
                <Table.Th>価格</Table.Th>
                <Table.Th>目標杯数</Table.Th>
                <Table.Th>表示順</Table.Th>
                <Table.Th>状態</Table.Th>
                <Table.Th>オプション</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {menu.menuItems.map((menuItem) => (
                <Table.Tr key={menuItem.id}>
                  <Table.Td>{menuItem.name}</Table.Td>
                  <Table.Td>{menuItem.price}円</Table.Td>
                  <Table.Td>{menuItem.targetQuantity}</Table.Td>
                  <Table.Td>{menuItem.sortOrder}</Table.Td>
                  <Table.Td>{menuItem.isActive ? "有効" : "無効"}</Table.Td>
                  <Table.Td>
                    {menuItem.options
                      .map(
                        (option) =>
                          `${option.name}${option.isDefault ? "（標準）" : ""}`
                      )
                      .join("・")}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => openEdit(menuItem)}
                      disabled={settled}
                    >
                      編集
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal
        opened={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "メニューを編集" : "メニューを追加"}
      >
        {form && (
          <Stack gap="md">
            <TextInput
              label="名前"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.currentTarget.value })
              }
            />
            <NumberInput
              label="価格"
              description="オプション無しの価格"
              value={form.price}
              onChange={(value) => setForm({ ...form, price: Number(value) })}
            />
            <NumberInput
              label="目標杯数"
              value={form.targetQuantity}
              onChange={(value) =>
                setForm({ ...form, targetQuantity: Number(value) })
              }
            />
            <NumberInput
              label="表示順"
              value={form.sortOrder}
              onChange={(value) =>
                setForm({ ...form, sortOrder: Number(value) })
              }
            />
            <TextInput
              label="画像ファイル名"
              description="public/images に置いたファイル名"
              value={form.image}
              onChange={(event) =>
                setForm({ ...form, image: event.currentTarget.value })
              }
            />
            <Switch
              label="有効"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.currentTarget.checked })
              }
            />

            <Stack gap="xs">
              <Text size="sm" fw={500}>
                付けられるオプション
              </Text>
              {menu.options.length === 0 && (
                <Text size="sm" c="dimmed">
                  先にオプションを追加してください
                </Text>
              )}
              {menu.options.map((option) => {
                const selected = form.options.find(
                  ({ optionId }) => optionId === option.id
                );
                return (
                  <Group key={option.id} gap="lg">
                    <Checkbox
                      label={`${option.name} +${option.price}円`}
                      checked={selected !== undefined}
                      onChange={(event) =>
                        toggleOption(option.id, event.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label="標準で選択"
                      checked={selected?.isDefault ?? false}
                      disabled={selected === undefined}
                      onChange={(event) =>
                        toggleDefault(option.id, event.currentTarget.checked)
                      }
                    />
                  </Group>
                );
              })}
            </Stack>

            <Group justify="flex-end" gap="sm">
              <Button variant="light" radius="md" onClick={() => setForm(null)}>
                キャンセル
              </Button>
              <Button radius="md" onClick={handleSave}>
                保存する
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}
