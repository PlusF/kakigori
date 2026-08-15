"use client";

import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useContext, useState } from "react";
import { settleYear } from "../_actions/settleYear";
import { LoadingContext } from "../_contexts/LoadingContext";
import { YearContext, isSettled } from "../_contexts/YearContext";

/** ナビゲーションからは辿れない。URL を直接開いて使う */
export default function Settle() {
  const theme = useMantineTheme();
  const { startLoading, stopLoading } = useContext(LoadingContext);
  const { year, years, setYears } = useContext(YearContext);
  const [modalOpened, setModalOpened] = useState(false);
  const settled = isSettled(years, year);

  const handleSettleYear = async () => {
    if (!year) return;

    startLoading();
    try {
      const result = await settleYear(year);
      if (!result.ok) {
        notifications.show({
          title: "エラー",
          message: result.message,
          color: "red",
        });
        return;
      }
      setYears(result.data);
      setModalOpened(false);
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

  return (
    <Stack gap="xl">
      <Title order={1} size="h1" c={theme.primaryColor}>
        会計確定
      </Title>

      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text>{year}年</Text>
            {settled ? (
              <Badge color="gray" size="lg" variant="light">
                確定済み
              </Badge>
            ) : (
              <Badge color="green" size="lg" variant="light">
                未確定
              </Badge>
            )}
          </Group>

          <Text size="sm" c="dimmed">
            確定するとこの年の注文・提供の記録を一切変更できなくなります。取り消しはできません。
          </Text>

          <Button
            variant="filled"
            radius="md"
            onClick={() => setModalOpened(true)}
            disabled={!year || settled}
          >
            {year}年の会計を確定する
          </Button>
        </Stack>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="会計を確定"
      >
        <Stack gap="md">
          <Text>{year}年の会計を確定します。取り消しはできません。</Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              radius="md"
              onClick={() => setModalOpened(false)}
            >
              キャンセル
            </Button>
            <Button variant="filled" radius="md" onClick={handleSettleYear}>
              確定する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
