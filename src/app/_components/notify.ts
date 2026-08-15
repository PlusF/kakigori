import { notifications } from "@mantine/notifications";

export const notifyError = (message: string) =>
  notifications.show({ title: "エラー", message, color: "red" });

export const notifySuccess = (title: string, message: string) =>
  notifications.show({ title, message, color: "green" });
