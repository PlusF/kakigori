/**
 * Server Action の引数は型で守れないため実行時に弾く。
 * year が undefined のまま Prisma に渡ると where 句が無視され、全年が対象になる。
 */
export function assertYear(year: number) {
  if (!Number.isInteger(year)) {
    throw new Error(`invalid year: ${year}`);
  }
}
