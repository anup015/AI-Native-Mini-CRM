import { CustomerGender, PreferredChannel } from "@prisma/client";
import { NextResponse } from "next/server";

import { asApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [cities, customersWithTags] = await Promise.all([
      prisma.customer.findMany({
        distinct: ["city"],
        orderBy: { city: "asc" },
        select: { city: true },
        where: { city: { not: null } }
      }),
      prisma.customer.findMany({
        select: { tags: true }
      })
    ]);

    const tags = Array.from(new Set(customersWithTags.flatMap((customer) => customer.tags))).sort((left, right) => left.localeCompare(right));

    return NextResponse.json({
      cities: cities.map((customer) => customer.city).filter(Boolean),
      tags,
      genders: Object.values(CustomerGender),
      preferredChannels: Object.values(PreferredChannel)
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
