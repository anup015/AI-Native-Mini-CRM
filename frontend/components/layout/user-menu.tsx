"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function UserMenu({ name, email, role }: { name?: string | null; email?: string | null; role?: string | null }) {
  const displayInitials = (name ?? "Team Member")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/40 px-3 py-1.5 dark:bg-white/5 shadow-sm" title={email ?? undefined}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white shadow-inner">
        {displayInitials}
      </div>
      <div className="hidden text-left sm:block">
        <p className="text-xs font-bold leading-tight">{name ?? "Team member"}</p>
        <span className="inline-flex items-center rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-bold text-purple-400">
          {role ?? "MEMBER"}
        </span>
      </div>
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </Button>
    </div>
  );
}
