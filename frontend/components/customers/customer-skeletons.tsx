"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function CustomerTableSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: 8 }).map((_, index) => <SkeletonBlock key={index} className="h-12" />)}
      </CardContent>
    </Card>
  );
}

export function CustomerDashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 p-5">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="h-9 w-full max-w-xl" />
          <SkeletonBlock className="h-4 w-full max-w-2xl" />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 p-5">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </section>
          <Card><CardContent className="p-4"><SkeletonBlock className="h-24" /></CardContent></Card>
          <Card><CardContent className="p-6"><SkeletonBlock className="h-[280px]" /></CardContent></Card>
          <CustomerTableSkeleton />
        </div>
        <Card>
          <CardContent className="space-y-4 p-5">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CustomerProfileSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-24" />)}
          </CardContent>
        </Card>
        <Card><CardContent className="space-y-3 p-6">{Array.from({ length: 5 }).map((_, index) => <SkeletonBlock key={index} className="h-20" />)}</CardContent></Card>
      </div>
      <Card><CardContent className="space-y-4 p-6">{Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-8" />)}</CardContent></Card>
    </div>
  );
}
