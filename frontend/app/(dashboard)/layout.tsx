import { redirect } from "next/navigation";
import { Search } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="space-y-6">
        <header className="glass-premium flex flex-col gap-4 items-stretch justify-between rounded-2xl p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">Command Center</p>
            <h2 className="font-sora text-lg font-bold tracking-tight mt-0.5">Marketing Operating System</h2>
          </div>
          
          {/* Global Search & AI Quick Actions */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="relative hidden w-full max-w-sm sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources or ask Copilot (⌘K)..."
                className="h-10 w-full rounded-xl border border-border bg-background/40 pl-9 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
                readOnly
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-bold text-muted-foreground">
                <span>⌘</span>K
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <UserMenu name={session.user.name} email={session.user.email} role={session.user.role} />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
