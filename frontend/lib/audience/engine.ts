import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  SEGMENT_FIELDS,
  SEGMENT_LOGICS,
  SegmentCondition,
  SegmentGroup,
  SegmentNode,
  SegmentRule,
  segmentRuleSchema
} from "@/lib/audience/types";

const fieldSet = new Set<string>(SEGMENT_FIELDS);
const numberOperators = new Set([">", ">=", "<", "<=", "="]);

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function compareNumber(left: number, operator: string, right: number) {
  switch (operator) {
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "=":
      return left === right;
    default:
      return false;
  }
}

function describeCondition(condition: SegmentCondition) {
  const value = Array.isArray(condition.value) ? condition.value.join(", ") : String(condition.value ?? "any");
  const lookback = condition.lookbackDays ? ` within ${condition.lookbackDays} days` : "";
  return `${condition.field} ${condition.operator} ${value}${lookback}`;
}

export function describeRule(rule: SegmentRule): string {
  const parts = rule.conditions.map((node) => {
    if ("field" in node) {
      return describeCondition(node);
    }

    return `(${describeRule(node)})`;
  });

  return parts.join(` ${rule.logic} `);
}

function buildDirectWhere(condition: SegmentCondition): Prisma.CustomerWhereInput | null {
  const value = condition.value;

  switch (condition.field) {
    case "city":
    case "orderCategory": {
      const text = String(value ?? "");
      switch (condition.operator) {
        case "=":
          return condition.field === "orderCategory"
            ? { orders: { some: { category: { equals: text, mode: "insensitive" } } } }
            : { city: { equals: text, mode: "insensitive" } };
        case "!=":
          return condition.field === "orderCategory"
            ? { NOT: { orders: { some: { category: { equals: text, mode: "insensitive" } } } } }
            : { NOT: { city: { equals: text, mode: "insensitive" } } };
        case "contains":
          return condition.field === "orderCategory"
            ? { orders: { some: { category: { contains: text, mode: "insensitive" } } } }
            : { city: { contains: text, mode: "insensitive" } };
        case "in":
          return condition.field === "orderCategory"
            ? { orders: { some: { category: { in: normalizeStringArray(value) } } } }
            : { city: { in: normalizeStringArray(value) } };
        case "notIn":
          return condition.field === "orderCategory"
            ? { NOT: { orders: { some: { category: { in: normalizeStringArray(value) } } } } }
            : { city: { notIn: normalizeStringArray(value) } };
        default:
          return null;
      }
    }
    case "gender":
      return { gender: { equals: String(value) as Prisma.EnumCustomerGenderFilter["equals"] } };
    case "preferredChannel":
      return { preferredChannel: { equals: String(value) as Prisma.EnumPreferredChannelFilter["equals"] } };
    case "tags": {
      switch (condition.operator) {
        case "has":
          return { tags: { has: String(value) } };
        case "hasAny":
          return { tags: { hasSome: normalizeStringArray(value) } };
        case "hasEvery":
          return { tags: { hasEvery: normalizeStringArray(value) } };
        case "in":
          return { tags: { hasSome: normalizeStringArray(value) } };
        default:
          return null;
      }
    }
    case "age":
      if (toNumber(value) == null || !numberOperators.has(condition.operator)) return null;
      return { age: { [operatorToPrisma(condition.operator)]: toNumber(value) as number } };
    case "totalSpend":
      if (toNumber(value) == null || !numberOperators.has(condition.operator)) return null;
      return { totalSpend: { [operatorToPrisma(condition.operator)]: new Prisma.Decimal(toNumber(value) as number) } };
    case "lastOrderDate":
      if (!value) return null;
      return { lastOrderDate: { [operatorToPrisma(condition.operator)]: new Date(String(value)) } };
    case "lastOrderDays": {
      const days = toNumber(value);
      if (days == null) return null;
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      if (condition.operator === ">=" || condition.operator === ">") {
        return { OR: [{ lastOrderDate: { lte: cutoff } }, { lastOrderDate: null }] };
      }
      if (condition.operator === "<=" || condition.operator === "<") {
        return { lastOrderDate: { gte: cutoff } };
      }
      return { lastOrderDate: { equals: cutoff } };
    }
    default:
      return null;
  }
}

function operatorToPrisma(operator: string) {
  switch (operator) {
    case "=":
      return "equals";
    case "!=":
      return "not";
    case ">":
      return "gt";
    case ">=":
      return "gte";
    case "<":
      return "lt";
    case "<=":
      return "lte";
    default:
      return "equals";
  }
}

async function resolveOrderAggregateIds(condition: SegmentCondition): Promise<Set<string>> {
  const lookbackDays = condition.lookbackDays ?? 30;
  const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  if (condition.field === "recentSpend") {
    const threshold = toNumber(condition.value);
    if (threshold == null) return new Set();

    const orders = await prisma.order.findMany({
      where: {
        purchaseDate: { gte: cutoff }
      },
      select: {
        customerId: true,
        amount: true
      }
    });

    const sums = new Map<string, number>();
    for (const order of orders) {
      sums.set(order.customerId, (sums.get(order.customerId) ?? 0) + Number(order.amount));
    }

    const matches = [...sums.entries()].filter(([, sum]) => compareNumber(sum, condition.operator, threshold));
    return new Set(matches.map(([customerId]) => customerId));
  }

  if (condition.field === "ordersCount") {
    const threshold = toNumber(condition.value);
    if (threshold == null) return new Set();

    const orders = await prisma.order.findMany({
      where: condition.lookbackDays ? { purchaseDate: { gte: cutoff } } : undefined,
      select: {
        customerId: true
      }
    });

    const counts = new Map<string, number>();
    for (const order of orders) {
      counts.set(order.customerId, (counts.get(order.customerId) ?? 0) + 1);
    }

    const matches = [...counts.entries()].filter(([, count]) => compareNumber(count, condition.operator, threshold));
    return new Set(matches.map(([customerId]) => customerId));
  }

  return new Set();
}

async function resolveLeafIds(condition: SegmentCondition): Promise<Set<string>> {
  const directWhere = buildDirectWhere(condition);
  if (directWhere) {
    const customers = await prisma.customer.findMany({
      where: directWhere,
      select: { id: true }
    });

    return new Set(customers.map((customer) => customer.id));
  }

  if (condition.field === "ordersCount" || condition.field === "recentSpend") {
    return resolveOrderAggregateIds(condition);
  }

  return new Set();
}

export async function resolveAudience(ruleInput: unknown) {
  const rule = segmentRuleSchema.parse(ruleInput);
  const normalizedRule = rule;

  async function resolveNode(node: SegmentNode): Promise<Set<string>> {
    if ("field" in node) {
      return resolveLeafIds(node);
    }

    const childSets = await Promise.all(node.conditions.map((child) => resolveNode(child)));
    if (!childSets.length) return new Set();

    if (node.logic === "AND") {
      return childSets.reduce((accumulator, current) => {
        const next = new Set<string>();
        for (const id of accumulator) {
          if (current.has(id)) next.add(id);
        }
        return next;
      });
    }

    const union = new Set<string>();
    for (const ids of childSets) {
      for (const id of ids) union.add(id);
    }
    return union;
  }

  const ids = await resolveNode(normalizedRule);
  const customers = ids.size
    ? await prisma.customer.findMany({
        where: { id: { in: [...ids] } },
        orderBy: [{ totalSpend: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          preferredChannel: true,
          totalSpend: true,
          lastOrderDate: true,
          tags: true
        }
      })
    : [];

  return {
    rule,
    count: ids.size,
    customerIds: [...ids],
    customers,
    explanation: describeRule(rule)
  };
}
