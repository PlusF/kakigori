import React from "react";
import { isAdmin } from "@/lib/admin";
import AdminSignIn from "./_components/AdminSignIn";

/** 認証結果をビルド時に焼き込ませない */
export const dynamic = "force-dynamic";

/** 合言葉が合うまで中身を一切描画しない */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (await isAdmin()) ? <>{children}</> : <AdminSignIn />;
}
