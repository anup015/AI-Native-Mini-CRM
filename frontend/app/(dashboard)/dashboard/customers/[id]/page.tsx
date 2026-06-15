import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CustomerDetailMetrics } from "@/components/customers/customer-detail-metrics";
import { CustomerOrderHistory } from "@/components/customers/customer-order-history";
import { CustomerProfileCard } from "@/components/customers/customer-profile-card";
import { Button } from "@/components/ui/button";
import { formatDecimal, toNumber } from "@/lib/customer-utils";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: string | number) {
  return `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    notFound();
  }

  const orderHistory = customer.orders.map((order) => ({
    id: order.id,
    amount: formatDecimal(order.amount),
    category: order.category,
    status: order.status,
    purchaseDate: order.purchaseDate.toISOString(),
    itemCount: Array.isArray(order.items) ? order.items.length : 1
  }));

  const totalOrderValue = customer.orders.reduce((sum, order) => sum + toNumber(order.amount), 0);
  const avgOrderValue = totalOrderValue / Math.max(orderHistory.length, 1);
  const metrics = [
    { label: "Lifetime value", value: formatCurrency(formatDecimal(customer.totalSpend)) },
    { label: "Orders", value: String(orderHistory.length) },
    { label: "Avg order value", value: formatCurrency(avgOrderValue) },
    { label: "Last purchase", value: customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : "No order history" }
  ];

  return (
    <div className="space-y-4">
      <div>
        <Button asChild variant="secondary" size="sm" className="gap-2">
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <CustomerDetailMetrics name={customer.name} email={customer.email} metrics={metrics} />
          <CustomerOrderHistory orders={orderHistory} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:h-fit">
          <CustomerProfileCard
            city={customer.city}
            phone={customer.phone}
            preferredChannel={customer.preferredChannel}
            tags={customer.tags}
            ordersCount={orderHistory.length}
          />
        </aside>
      </div>
    </div>
  );
}
