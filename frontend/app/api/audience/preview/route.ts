import { NextResponse } from "next/server";

import { resolveAudience } from "@/lib/audience/engine";
import { segmentRuleSchema } from "@/lib/audience/types";
import { asApiError, AppError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = segmentRuleSchema.safeParse(body.rule ?? body);

    if (!parsed.success) {
      throw new AppError("Invalid audience rule.", 400);
    }

    const result = await resolveAudience(parsed.data);

    return NextResponse.json({
      count: result.count,
      sampleCustomers: result.customers,
      explanation: result.explanation,
      rule: result.rule
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
