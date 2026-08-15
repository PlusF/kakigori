"use client";

import { AppShell, NavLink, Stack, useMantineTheme } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconHome,
  IconMenu2,
  IconShoppingCart,
  IconHistory,
} from "@tabler/icons-react";

const links = [
  { href: "/", label: "ホーム", icon: IconHome },
  { href: "/menu", label: "メニュー", icon: IconMenu2 },
  { href: "/order", label: "注文", icon: IconShoppingCart },
  { href: "/order-history", label: "注文履歴", icon: IconHistory },
];

export default function Navbar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const theme = useMantineTheme();

  return (
    <AppShell.Navbar p="md">
      <Stack gap="xs">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <NavLink
              key={href}
              active={active}
              component={Link}
              href={href}
              label={label}
              leftSection={<Icon size={20} />}
              onClick={onNavigate}
              variant="filled"
              styles={{
                root: {
                  borderRadius: theme.radius.md,
                  fontWeight: active ? 600 : 400,
                },
              }}
            />
          );
        })}
      </Stack>
    </AppShell.Navbar>
  );
}
