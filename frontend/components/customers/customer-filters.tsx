"use client";

import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCustomerFilterOptions } from "@/hooks/use-customers";

export type CustomerFilterState = {
  search: string;
  city: string;
  gender: string;
  preferredChannel: string;
  tag: string;
};

type Props = {
  value: CustomerFilterState;
  onChange: (next: Partial<CustomerFilterState>) => void;
  onReset: () => void;
};

export function CustomerFilters({ value, onChange, onReset }: Props) {
  const { data } = useCustomerFilterOptions();
  const cities = data?.cities ?? [];
  const channels = data?.preferredChannels ?? ["EMAIL", "SMS", "WHATSAPP", "PUSH"];
  const genders = data?.genders ?? ["MALE", "FEMALE", "NON_BINARY", "OTHER", "UNKNOWN"];
  const tags = data?.tags ?? [];

  return (
    <Card className="overflow-hidden border-white/10 dark:bg-white/5 shadow-md">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Audience Segment Filters
            </div>
            <p className="text-[10px] text-muted-foreground">Refine directory entries by demographics, location, and communication preferences.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" className="gap-2 h-8 text-xs border border-border bg-background/50 hover:bg-secondary" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 h-10 text-xs bg-background/30 border-border focus-visible:ring-primary focus-visible:ring-offset-0" placeholder="Search customer info or tags..." value={value.search} onChange={(event) => onChange({ search: event.target.value })} />
          </div>
          <select className="h-10 rounded-xl border border-border bg-background/30 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 cursor-pointer" value={value.city} onChange={(event) => onChange({ city: event.target.value })}>
            <option value="" className="bg-card">All cities</option>
            {cities.map((city) => <option key={city} value={city} className="bg-card">{city}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border bg-background/30 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 cursor-pointer" value={value.gender} onChange={(event) => onChange({ gender: event.target.value })}>
            <option value="" className="bg-card">All genders</option>
            {genders.map((gender) => <option key={gender} value={gender} className="bg-card">{gender.replaceAll("_", " ")}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border bg-background/30 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 cursor-pointer" value={value.preferredChannel} onChange={(event) => onChange({ preferredChannel: event.target.value })}>
            <option value="" className="bg-card">All channels</option>
            {channels.map((channel) => <option key={channel} value={channel} className="bg-card">{channel}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-border bg-background/30 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 cursor-pointer" value={value.tag} onChange={(event) => onChange({ tag: event.target.value })}>
            <option value="" className="bg-card">All tags</option>
            {tags.map((tag) => <option key={tag} value={tag} className="bg-card">{tag}</option>)}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
