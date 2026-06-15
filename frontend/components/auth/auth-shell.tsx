"use client";

import { ReactNode } from "react";
import { Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const highlights = [
  { icon: Sparkles, title: "AI-native CRM", text: "Personalized campaigns and insights built in." },
  { icon: Shield, title: "Secure by default", text: "Password hashing, JWT sessions, protected routes." },
  { icon: Zap, title: "Fast demo flow", text: "Signup, login, and demo access without friction." }
];

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),transparent_26%)] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/60 shadow-2xl backdrop-blur-xl dark:bg-slate-950/60 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#111827_35%,#0b1220_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_24%)]" />
          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{eyebrow}</p>
            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-black leading-tight md:text-5xl">{title}</h1>
              <p className="max-w-lg text-base text-slate-300 md:text-lg">{description}</p>
            </div>
          </div>
          <div className="relative z-10 grid gap-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="rounded-xl bg-white/10 p-2 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-300">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className={cn("relative flex items-center justify-center p-6 md:p-10", "bg-background/80") }>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.08),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_22%)]" />
          <div className="relative z-10 w-full max-w-md space-y-6">{children}{footer ? <div>{footer}</div> : null}</div>
        </section>
      </div>
    </div>
  );
}
