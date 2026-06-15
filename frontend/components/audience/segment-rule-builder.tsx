"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SEGMENT_FIELDS,
  SEGMENT_LOGICS,
  SEGMENT_OPERATORS,
  SegmentCondition,
  SegmentField,
  SegmentGroup,
  SegmentNode,
  SegmentOperator,
  SegmentRule
} from "@/lib/audience/types";

const fieldOperatorMap: Record<SegmentField, readonly SegmentOperator[]> = {
  city: ["=", "!=", "in", "notIn", "contains"],
  gender: ["=", "!=", "in", "notIn"],
  preferredChannel: ["=", "!=", "in", "notIn"],
  tags: ["has", "hasAny", "hasEvery", "in", "notIn"],
  age: [">", ">=", "<", "<=", "="],
  totalSpend: [">", ">=", "<", "<=", "="],
  lastOrderDate: [">", ">=", "<", "<=", "="],
  lastOrderDays: [">", ">=", "<", "<=", "="],
  ordersCount: [">", ">=", "<", "<=", "="],
  recentSpend: [">", ">=", "<", "<=", "="],
  orderCategory: ["=", "!=", "contains", "in", "notIn"]
};

function defaultCondition(): SegmentCondition {
  return { field: "city", operator: "=", value: "Mumbai" };
}

function createGroup(): SegmentGroup {
  return { logic: "AND", conditions: [defaultCondition()] };
}

function isGroup(node: SegmentNode): node is SegmentGroup {
  return "logic" in node;
}

function toArrayInput(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "");
}

function parseConditionValue(field: string, operator: string, rawValue: string) {
  const trimmed = rawValue.trim();

  if (["in", "notIn", "hasAny", "hasEvery"].includes(operator)) {
    return trimmed ? trimmed.split(",").map((item) => item.trim()).filter(Boolean) : [];
  }

  if (["age", "totalSpend", "lastOrderDays", "ordersCount", "recentSpend"].includes(field)) {
    return trimmed === "" ? null : Number(trimmed);
  }

  return trimmed;
}

function ConditionEditor({ condition, onChange, onRemove }: { condition: SegmentCondition; onChange: (next: SegmentCondition) => void; onRemove: () => void }) {
  const operators = fieldOperatorMap[condition.field] ?? SEGMENT_OPERATORS;

  return (
    <div className="rounded-xl border border-border/80 bg-background/40 p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] items-start">
        <select className="h-9 rounded-xl border border-border bg-background/50 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer transition-all duration-200" value={condition.field} onChange={(event) => onChange({ ...condition, field: event.target.value as SegmentCondition["field"], operator: fieldOperatorMap[event.target.value as SegmentField]?.[0] ?? "=", value: event.target.value === "tags" ? [] : "" })}>
          {SEGMENT_FIELDS.map((field) => <option key={field} value={field} className="bg-card">{field}</option>)}
        </select>
        <select className="h-9 rounded-xl border border-border bg-background/50 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer transition-all duration-200" value={condition.operator} onChange={(event) => onChange({ ...condition, operator: event.target.value as SegmentCondition["operator"] })}>
          {operators.map((operator) => <option key={operator} value={operator} className="bg-card">{operator}</option>)}
        </select>
        <div className="space-y-1.5 w-full">
          <Input
            value={toArrayInput(condition.value)}
            placeholder={condition.operator.includes("Any") || condition.operator.includes("Every") || condition.operator === "in" || condition.operator === "notIn" ? "comma separated values" : "value"}
            onChange={(event) => onChange({ ...condition, value: parseConditionValue(condition.field, condition.operator, event.target.value) })}
            className="h-9 text-xs bg-background/30 border-border"
          />
          {condition.field === "recentSpend" || condition.field === "ordersCount" ? (
            <Input
              type="number"
              min={1}
              placeholder="lookback days"
              value={condition.lookbackDays ?? ""}
              onChange={(event) => onChange({ ...condition, lookbackDays: event.target.value ? Number(event.target.value) : undefined })}
              className="h-9 text-xs bg-background/30 border-border"
            />
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-xl shrink-0" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function GroupEditor({ group, onChange, onRemove, level = 0 }: { group: SegmentGroup; onChange: (next: SegmentGroup) => void; onRemove?: () => void; level?: number }) {
  return (
    <Card className={cn("border-white/10 bg-white/70 dark:bg-white/5", level > 0 ? "ml-4 border-l-2 border-l-primary/30" : "") }>
      <CardHeader className="pb-3 pt-4 px-4 flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="font-sora text-xs font-bold uppercase tracking-wider text-foreground">Rule Logic Block</CardTitle>
          <p className="text-[9px] text-muted-foreground">Apply relational AND/OR matching rules.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-8 rounded-lg border border-border bg-background/50 px-2 text-[10px] font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer" value={group.logic} onChange={(event) => onChange({ ...group, logic: event.target.value as SegmentGroup["logic"] })}>
            {SEGMENT_LOGICS.map((logic) => <option key={logic} value={logic} className="bg-card">{logic}</option>)}
          </select>
          {onRemove ? (
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-lg" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {group.conditions.map((node, index) => (
          <div key={index} className="space-y-3">
            {isGroup(node) ? (
              <GroupEditor
                group={node}
                level={level + 1}
                onChange={(next) => {
                  const nextConditions = [...group.conditions];
                  nextConditions[index] = next;
                  onChange({ ...group, conditions: nextConditions });
                }}
                onRemove={() => {
                  onChange({ ...group, conditions: group.conditions.filter((_, currentIndex) => currentIndex !== index) });
                }}
              />
            ) : (
              <ConditionEditor
                condition={node}
                onChange={(next) => {
                  const nextConditions = [...group.conditions];
                  nextConditions[index] = next;
                  onChange({ ...group, conditions: nextConditions });
                }}
                onRemove={() => {
                  onChange({ ...group, conditions: group.conditions.filter((_, currentIndex) => currentIndex !== index) });
                }}
              />
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" className="h-7 text-[10px] font-bold gap-1 rounded-lg border bg-background/50 hover:bg-secondary" onClick={() => onChange({ ...group, conditions: [...group.conditions, defaultCondition()] })}>
            <Plus className="h-3 w-3" />
            Add rule
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-7 text-[10px] font-bold gap-1 rounded-lg border bg-background/50 hover:bg-secondary" onClick={() => onChange({ ...group, conditions: [...group.conditions, createGroup()] })}>
            <Plus className="h-3 w-3" />
            Add logic group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SegmentRuleBuilder({ value, onChange }: { value: SegmentRule; onChange: (next: SegmentRule) => void }) {
  return <GroupEditor group={value} onChange={onChange} />;
}
