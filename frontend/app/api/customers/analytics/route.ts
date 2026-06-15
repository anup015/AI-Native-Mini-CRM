import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { asApiError } from "@/lib/errors";
import { toNumber } from "@/lib/customer-utils";

export async function GET() {
  try {
    const [byCity, byChannel, byTags, bySpendBand, totalCustomers, activeCustomers, highValueCustomers, summarySpend] = await Promise.all([
      prisma.customer.groupBy({
        by: ["city"],
        _count: { id: true },
        _sum: { totalSpend: true },
        orderBy: { _count: { id: "desc" } },
        take: 6
      }),
      prisma.customer.groupBy({
        by: ["preferredChannel"],
        _count: { id: true },
        _sum: { totalSpend: true }
      }),
      prisma.customer.findMany({
        select: { tags: true, totalSpend: true }
      }),
      prisma.customer.groupBy({
        by: ["gender"],
        _count: { id: true },
        _avg: { age: true }
      }),
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          lastOrderDate: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
          }
        }
      }),
      prisma.customer.count({
        where: {
          totalSpend: {
            gte: new Prisma.Decimal(20000)
          }
        }
      }),
      prisma.customer.aggregate({
        _avg: {
          totalSpend: true
        }
      })
    ]);

    const tags = byTags.flatMap((customer) => customer.tags);
    const tagCounts = tags.reduce<Record<string, number>>((accumulator, tag) => {
      accumulator[tag] = (accumulator[tag] ?? 0) + 1;
      return accumulator;
    }, {});

    const topTags = Object.entries(tagCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      highValueCustomers,
      avgSpend: toNumber(summarySpend._avg.totalSpend),
      byCity: byCity.map((item) => ({
        city: item.city ?? "Unknown",
        customers: item._count.id,
        spend: toNumber(item._sum.totalSpend)
      })),
      byChannel: byChannel.map((item) => ({
        channel: item.preferredChannel,
        customers: item._count.id,
        spend: toNumber(item._sum.totalSpend)
      })),
      byGender: bySpendBand.map((item) => ({
        gender: item.gender,
        customers: item._count.id,
        avgAge: item._avg.age ?? 0
      })),
      topTags
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
