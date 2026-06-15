import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { env } from "@/lib/env";
import { auth } from "@/lib/auth";
import { asApiError, AppError } from "@/lib/errors";

const querySchema = z.object({
  prompt: z.string().trim().min(3).max(600)
});

const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = querySchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Please enter a question or instruction.", 400);
    }

    const { prompt } = parsed.data;

    let text = "";
    try {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const systemPrompt = `You are a Xeno CRM Copilot, an AI assistant built inside a marketing CRM.
The user is a brand marketer. They are asking you a question, requesting copywriting help, or seeking CRM advice.
Query: "${prompt}"

Provide a concise, professional, and actionable answer. Use bullet points or bold text if helpful. Limit to 3 paragraphs max.`;

      const result = await model.generateContent(systemPrompt);
      text = result.response.text().trim();
    } catch {
      text = `Hello! I am the Xeno CRM AI Copilot. It seems the Gemini API key is currently offline or unconfigured.

However, I can guide you through the CRM's key features:
* **Audience Segments**: Create dynamic cohorts of customers based on cities, spends, preferred channels, and shopping history using plain English rules or the visual builder.
* **AI Outreach copy**: Generate optimized Email, SMS, WhatsApp, and RCS push copy tailored to your audience.
* **Simulated Dispatches**: Launch campaigns and track delivery status (Sent, Delivered, Opened, Clicked, Converted) updated in real-time by the carrier simulator.

Let me know if there's anything else I can help you with!`;
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
