"use client";

import {
  Button,
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
import { saveOption } from "@/app/_actions/saveOption";
import { LoadingContext } from "@/app/_contexts/LoadingContext";
import { YearContext } from "@/app/_contexts/YearContext";
import { notifyError } from "@/app/_components/notify";
import { AdminMenu, Option, OptionInput } from "@/types/types";

export default function OptionPanel({
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
  const [form, setForm] = useState<OptionInput | null>(null);

  const openNew = () =>
    setForm({
      id: null,
      name: "",
      price: 0,
      sortOrder: (menu.options.at(-1)?.sortOrder ?? 0) + 1,
      isActive: true,
    });

  const openEdit = (option: Option) =>
    setForm({
      id: option.id,
      name: option.name,
      price: option.price,
      sortOrder: option.sortOrder,
      isActive: option.isActive,
    });

  const handleSave = async () => {
    if (!year || !form) return;

    startLoading();
    try {
      const result = await saveOption(year, form);
      if (!result.ok) {
        notifyError(result.message);
        return;
      }
      setMenu(result.data);
      setForm(null);
    } catch (error) {
      console.error("Failed to save option:", error);
      notifyError("オプションの保存に失敗しました");
    } finally {
      stopLoading();
    }
  };

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2} size="h4">
            オプション
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

        {menu.options.length === 0 ? (
          <Text c="dimmed">オプションがありません</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>名前</Table.Th>
                <Table.Th>価格</Table.Th>
                <Table.Th>表示順</Table.Th>
                <Table.Th>状態</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {menu.options.map((option) => (
                <Table.Tr key={option.id}>
                  <Table.Td>{option.name}</Table.Td>
                  <Table.Td>{option.price}円</Table.Td>
                  <Table.Td>{option.sortOrder}</Table.Td>
                  <Table.Td>{option.isActive ? "有効" : "無効"}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => openEdit(option)}
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
        title={form?.id ? "オプションを編集" : "オプションを追加"}
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
              value={form.price}
              onChange={(value) => setForm({ ...form, price: Number(value) })}
            />
            <NumberInput
              label="表示順"
              value={form.sortOrder}
              onChange={(value) =>
                setForm({ ...form, sortOrder: Number(value) })
              }
            />
            <Switch
              label="有効"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.currentTarget.checked })
              }
            />
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
