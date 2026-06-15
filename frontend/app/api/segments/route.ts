import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { resolveAudience } from "@/lib/audience/engine";
import { segmentSaveSchema } from "@/lib/audience/types";
import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";

export async function GET() {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        customerCount: true,
        lastComputedAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({ segments });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("You must be signed in to save a segment.", 401);
    }

    const body = await request.json();
    const parsed = segmentSaveSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid segment payload.", 400);
    }

    const audience = await resolveAudience(parsed.data.rule);

    const segment = await prisma.$transaction(async (transaction) => {
      const createdSegment = await transaction.segment.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          rules: parsed.data.rule,
          customerCount: audience.count,
          lastComputedAt: new Date(),
          createdById: session.user.id
        }
      });

      if (audience.customerIds.length) {
        await transaction.customerSegment.createMany({
          data: audience.customerIds.map((customerId) => ({
            customerId,
            segmentId: createdSegment.id
          })),
          skipDuplicates: true
        });
      }

      return createdSegment;
    });

    return NextResponse.json({
      segment,
      audience: {
        count: audience.count,
        sampleCustomers: audience.customers,
        explanation: audience.explanation
      }
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
