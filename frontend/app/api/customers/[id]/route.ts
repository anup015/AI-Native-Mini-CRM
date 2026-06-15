import { NextResponse } from "next/server";

import { formatDecimal, toNumber } from "@/lib/customer-utils";
import { asApiError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            purchaseDate: "desc"
          }
        }
      }
    });

    if (!customer) {
      throw new AppError("Customer not found.", 404);
    }

    const orderHistory = customer.orders.map((order) => ({
      id: order.id,
      amount: formatDecimal(order.amount),
      category: order.category,
      status: order.status,
      purchaseDate: order.purchaseDate.toISOString(),
      itemCount: Array.isArray(order.items) ? order.items.length : 1
    }));

    const totalOrders = orderHistory.length;
    const totalOrderValue = customer.orders.reduce((sum, order) => sum + toNumber(order.amount), 0);
    const insights = [
      { label: "Lifetime value", value: `Rs. ${formatDecimal(customer.totalSpend)}` },
      { label: "Orders", value: String(totalOrders) },
      { label: "Avg order value", value: `Rs. ${(totalOrderValue / Math.max(totalOrders, 1)).toFixed(2)}` },
      { label: "Preferred channel", value: customer.preferredChannel },
      { label: "Last purchase", value: customer.lastOrderDate ? customer.lastOrderDate.toDateString() : "No order history" }
    ];

    return NextResponse.json({
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
      ordersCount: totalOrders,
      ordersValue: formatDecimal(totalOrderValue),
      insights,
      orderHistory
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
