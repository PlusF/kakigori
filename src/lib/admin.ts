import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kakigori-admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** セッションは持たず、合言葉そのものを Cookie に入れて毎回突き合わせる */
export async function isAdmin() {
  // ADMIN_PASSWORD 未設定で早期 return すると cookies() に触れず、
  // ページが静的プリレンダリングされて認証が実行時に走らなくなる
  const store = await cookies();
  const password = process.env.ADMIN_PASSWORD;

  return Boolean(password) && store.get(ADMIN_COOKIE)?.value === password;
}

/** Server Action は誰でも叩けるので、管理操作は必ず入口で通す */
export async function assertAdmin() {
  if (!(await isAdmin())) {
    throw new Error("管理者として認証されていません");
  }
}
