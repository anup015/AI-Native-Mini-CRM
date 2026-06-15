import { Sparkles, Users2 } from "lucide-react";

export function CustomerPageHeader() {
  return (
    <section className="glass-premium overflow-hidden rounded-2xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Users2 className="h-3.5 w-3.5" />
            Customer Intelligence
          </div>
          <h1 className="font-sora text-2xl font-extrabold tracking-tight md:text-3xl text-foreground">Customer Management Hub</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Analyze customer purchase patterns, filter target segments, and inspect order histories. Redefining segment-first CRM operations.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3 text-xs text-muted-foreground shadow-sm max-w-fit">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Built for segment-first marketing runs.</span>
        </div>
      </div>
    </section>
  );
}
