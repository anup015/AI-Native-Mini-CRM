import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { asApiError } from "@/lib/errors";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    return NextResponse.json({ leads });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
