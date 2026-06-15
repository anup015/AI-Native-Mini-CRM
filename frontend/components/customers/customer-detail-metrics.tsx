import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Metric = {
  label: string;
  value: string;
};

export function CustomerDetailMetrics({ name, email, metrics }: { name: string; email: string | null; metrics: Metric[] }) {
  const displayInitials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="border-white/10 dark:bg-white/5 shadow-md overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40 bg-background/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-black text-white shadow-md">
            {displayInitials}
          </div>
          <div>
            <CardTitle className="font-sora text-xl font-extrabold text-foreground">{name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{email ?? "No active email record"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 p-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border/60 bg-background/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-secondary/20 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{metric.label}</p>
            <p className="mt-1.5 break-words font-sora text-sm font-extrabold text-foreground">{metric.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
