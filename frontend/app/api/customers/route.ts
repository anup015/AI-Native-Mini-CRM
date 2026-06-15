import { NextResponse } from "next/server";
import { Prisma, CustomerGender, PreferredChannel } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";
import { CUSTOMER_SORT_FIELDS, formatDecimal, toNumber } from "@/lib/customer-utils";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  city: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  preferredChannel: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  minSpend: z.coerce.number().optional(),
  maxSpend: z.coerce.number().optional(),
  sortBy: z.enum(CUSTOMER_SORT_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

function buildWhere(params: z.infer<typeof listQuerySchema>) {
  const where: Prisma.CustomerWhereInput = {};

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q, mode: "insensitive" } },
      { city: { contains: params.q, mode: "insensitive" } },
      { tags: { hasSome: [params.q] } }
    ];
  }

  if (params.city) where.city = params.city;
  if (params.gender) where.gender = params.gender as CustomerGender;
  if (params.preferredChannel) where.preferredChannel = params.preferredChannel as PreferredChannel;
  if (params.tag) where.tags = { has: params.tag };
  if (params.minSpend != null || params.maxSpend != null) {
    where.totalSpend = {
      ...(params.minSpend != null ? { gte: new Prisma.Decimal(params.minSpend) } : {}),
      ...(params.maxSpend != null ? { lte: new Prisma.Decimal(params.maxSpend) } : {})
    };
  }

  return where;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      throw new AppError("Invalid customer query parameters.", 400);
    }

    const params = parsed.data;
    const where = buildWhere(params);

    const orderBy: Prisma.CustomerOrderByWithRelationInput =
      params.sortBy === "ordersCount"
        ? {
            orders: {
              _count: params.sortOrder
            }
          }
        : {
            [params.sortBy]: params.sortOrder
          };

    const [total, customers, analytics, cityCounts] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          _count: {
            select: { orders: true }
          },
          orders: {
            select: {
              amount: true
            }
          }
        }
      }),
      prisma.customer.groupBy({
        by: ["city"],
        _count: { id: true },
        _sum: { totalSpend: true }
      }),
      prisma.customer.groupBy({
        by: ["city"],
        _count: { id: true },
        orderBy: {
          _count: {
            id: "desc"
          }
        },
        take: 1
      })
    ]);

    const totalCustomers = await prisma.customer.count();
    const activeCustomers = await prisma.customer.count({
      where: {
        lastOrderDate: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
        }
      }
    });

    const highValueCustomers = await prisma.customer.count({
      where: {
        totalSpend: {
          gte: new Prisma.Decimal(20000)
        }
      }
    });

    const avgSpend = analytics.reduce((sum, item) => sum + toNumber(item._sum.totalSpend), 0) / Math.max(analytics.length, 1);
    const topCity = cityCounts[0]?.city ?? null;

    return NextResponse.json({
      customers: customers.map((customer) => {
        const ordersValue = customer.orders.reduce((sum, order) => sum + toNumber(order.amount), 0);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          city: customer.city,
          gender: customer.gender,
          age: customer.age,
          tags: customer.tags,
          preferredChannel: customer.preferredChannel,
          totalSpend: formatDecimal(customer.totalSpend),
          lastOrderDate: customer.lastOrderDate?.toISOString() ?? null,
          createdAt: customer.createdAt.toISOString(),
          ordersCount: customer._count.orders,
          ordersValue: formatDecimal(ordersValue)
        };
      }),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit))
      },
      analytics: {
        totalCustomers,
        activeCustomers,
        highValueCustomers,
        avgSpend: avgSpend.toFixed(2),
        topCity
      }
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
