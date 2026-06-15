import { NextResponse } from "next/server";

import { generateAudienceRule } from "@/lib/audience/gemini";
import { segmentGenerationSchema } from "@/lib/audience/types";
import { asApiError, AppError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = segmentGenerationSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Enter a natural language audience description.", 400);
    }

    const result = await generateAudienceRule(parsed.data.prompt);

    if (!result.rule) {
      return NextResponse.json({
        rule: null,
        explanation: result.explanation,
        source: result.source
      }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
