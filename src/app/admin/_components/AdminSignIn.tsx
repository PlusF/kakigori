"use client";

import { Button, Paper, PasswordInput, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSignIn } from "@/app/_actions/adminSignIn";
import { notifyError } from "@/app/_components/notify";

export default function AdminSignIn() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const result = await adminSignIn(password);
      if (!result.ok) {
        notifyError(result.message);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to sign in:", error);
      notifyError("認証に失敗しました");
    }
  };

  return (
    <Stack gap="xl">
      <Title order={1} size="h1">
        管理
      </Title>

      <Paper shadow="sm" p="lg" radius="md" withBorder maw={360}>
        <Stack gap="md">
          <PasswordInput
            label="合言葉"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
          />
          <Button radius="md" onClick={handleSubmit}>
            入る
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
