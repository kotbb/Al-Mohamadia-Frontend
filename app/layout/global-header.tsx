"use client";

import { UserMenu } from "./user-menu";

export function GlobalHeader() {
  return (
    <header className="flex items-center justify-end">
      <UserMenu />
    </header>
  );
}
