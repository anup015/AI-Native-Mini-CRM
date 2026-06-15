import { Prisma } from "@prisma/client";

export const CUSTOMER_SORT_FIELDS = ["createdAt", "name", "totalSpend", "lastOrderDate", "ordersCount"] as const;
export const CUSTOMER_FILTER_FIELDS = ["city", "gender", "preferredChannel", "tag"] as const;

export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];

export function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return new Prisma.Decimal(value).toNumber();
}

export function formatDecimal(value: Prisma.Decimal | number | string | null | undefined) {
  return toNumber(value).toFixed(2);
}
