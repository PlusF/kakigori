"use client";

import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useContext, useState } from "react";
import { settleYear } from "@/app/_actions/settleYear";
import { unsettleYear } from "@/app/_actions/unsettleYear";
import { createYear } from "@/app/_actions/createYear";
import { LoadingContext } from "@/app/_contexts/LoadingContext";
import { YearContext, isSettled } from "@/app/_contexts/YearContext";
import { notifyError, notifySuccess } from "@/app/_components/notify";
import { ActionResult, Year } from "@/types/types";

export default function YearPanel() {
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year, years, setYear, setYears } = useContext(YearContext);
  const [confirmOpened, setConfirmOpened] = useState(false);
  // 年一覧は非同期に届くので、未入力のうちは最新年の翌年を引き当て直す
  const [newYear, setNewYear] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const settled = isSettled(years, year);
  const targetYear = newYear ?? (years[0]?.year ?? new Date().getFullYear()) + 1;

  const run = async (
    action: () => Promise<ActionResult<Year[]>>,
    success: string
  ) => {
    startLoading();
    try {
      const result = await action();
      if (!result.ok) {
        notifyError(result.message);
        return null;
      }
      setYears(result.data);
      notifySuccess("完了", success);
      return result.data;
    } catch (error) {
      console.error("Failed to update year:", error);
      notifyError("処理に失敗しました");
      return null;
    } finally {
      stopLoading();
    }
  };

  const handleSettle = async () => {
    if (!year) return;
    if (await run(() => settleYear(year), `${year}年の会計を確定しました`)) {
      setConfirmOpened(false);
    }
  };

  const handleUnsettle = async () => {
    if (!year) return;
    await run(() => unsettleYear(year), `${year}年の確定を解除しました`);
  };

  const handleCreate = async () => {
    const created = await run(
      () => createYear(targetYear, newLabel),
      `${targetYear}年を作りました`
    );
    if (created) {
      setYear(targetYear);
      setNewLabel("");
      setNewYear(null);
    }
  };

  return (
    <Paper shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={2} size="h4">
          年
        </Title>

        <Group justify="space-between">
          <Text>{year}年</Text>
          <Badge color={settled ? "gray" : "green"} size="lg" variant="light">
            {settled ? "確定済み" : "未確定"}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          確定するとこの年の注文・メニューを一切変更できなくなります。
        </Text>

        <Group>
          <Button
            radius="md"
            onClick={() => setConfirmOpened(true)}
            disabled={!year || settled}
          >
            会計を確定する
          </Button>
          <Button
            variant="light"
            radius="md"
            onClick={handleUnsettle}
            disabled={!year || !settled}
          >
            確定を解除する
          </Button>
        </Group>

        <Title order={2} size="h4" mt="md">
          新しい年
        </Title>

        <Group align="flex-end">
          <NumberInput
            label="年"
            value={targetYear}
            onChange={(value) => setNewYear(Number(value) || null)}
            w={120}
          />
          <TextInput
            label="表示名"
            placeholder={`${targetYear}年`}
            value={newLabel}
            onChange={(event) => setNewLabel(event.currentTarget.value)}
            w={160}
          />
          <Button variant="light" radius="md" onClick={handleCreate}>
            まっさらな年を作る
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        title="会計を確定"
      >
        <Stack gap="md">
          <Text>{year}年の会計を確定します。</Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              radius="md"
              onClick={() => setConfirmOpened(false)}
            >
              キャンセル
            </Button>
            <Button radius="md" onClick={handleSettle}>
              確定する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
