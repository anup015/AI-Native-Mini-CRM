import { GoogleGenerativeAI } from "@google/generative-ai";

import type { Lead } from "@/types/lead";
import { env } from "@/lib/env";

const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function generateLeadInsights(leads: Lead[]) {
  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a CRM analyst. Return strict JSON with keys summary, risk, recommendation. Analyze these leads: ${JSON.stringify(
      leads
    )}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return JSON.parse(text) as {
      summary: string;
      risk: "low" | "medium" | "high";
      recommendation: string;
    };
  } catch {
    const totalLeads = leads.length;
    const stageCounts = leads.reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

    const summary = `Currently analyzing ${totalLeads} active leads in the pipeline with a total value of Rs. ${totalValue.toLocaleString()}. Pipeline stages: ${Object.entries(stageCounts).map(([stage, count]) => `${stage} (${count})`).join(", ")}.`;

    return {
      summary,
      risk: "medium" as const,
      recommendation: "Review the high-value deal stages and assign owners to pending pipeline steps manually."
    };
  }
}

export async function generateCampaignInsights(data: unknown) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a CRM Marketing Analyst. Analyze the following campaigns and channel performance metrics, and generate summary insights.
Campaign Performance Data: ${JSON.stringify(data)}

You MUST respond with a strict JSON object structure only. Do not include markdown code fences (like \`\`\`json), explanations, or meta commentary.
JSON Structure:
{
  "whatWorked": "A brief explanation of which channels, templates, or segments performed best.",
  "whatFailed": "Observations about low delivery rates, open rates, or conversions.",
  "bestAudience": "Identified segments that yielded the highest conversions or interaction counts.",
  "bestChannel": "The most effective channel (Email, SMS, WhatsApp, Push) and why.",
  "recommendations": [
    "First actionable, specific recommendation based on metrics.",
    "Second actionable, specific recommendation based on metrics.",
    "Third actionable, specific recommendation based on metrics."
  ]
}`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  text = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();

  try {
    return JSON.parse(text) as {
      whatWorked: string;
      whatFailed: string;
      bestAudience: string;
      bestChannel: string;
      recommendations: string[];
    };
  } catch {
    return {
      whatWorked: "AI could not parse overall analytics trends.",
      whatFailed: "Metrics analysis encountered unexpected parsing formatting.",
      bestAudience: "N/A",
      bestChannel: "N/A",
      recommendations: [
        "Review channels and customer conversion charts manually.",
        "Ensure segment target sizes are large enough for statistically significant counts.",
        "Confirm delivery webhook callbacks are processing correctly."
      ]
    };
  }
}

export async function askAICampaignQuestion(campaignData: unknown, question: string) {
  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI CRM Marketing Assistant. An analyst has asked you a question about a specific outreach campaign.
Campaign Details & Performance: ${JSON.stringify(campaignData)}
User's Question: "${question}"

Provide a concise, helpful, and highly contextual response answering their question based strictly on the campaign details and logs provided.
Keep it under 3 short paragraphs. Be direct and avoid generic marketing generalities.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    const data = campaignData as any;
    const title = data?.title ?? "Campaign";
    const status = data?.status ?? "DRAFT";
    const sent = data?.metrics?.sent ?? 0;
    const delivered = data?.metrics?.delivered ?? 0;
    const failed = data?.metrics?.failed ?? 0;
    const opened = data?.metrics?.opened ?? 0;
    const clicked = data?.metrics?.clicked ?? 0;
    const converted = data?.metrics?.converted ?? 0;

    const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : "0.0";
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : "0.0";
    const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : "0.0";
    const conversionRate = clicked > 0 ? ((converted / clicked) * 100).toFixed(1) : "0.0";

    return `I am currently operating in fallback analysis mode because the Gemini API is offline. Here is a direct calculation of your campaign performance metrics for "${title}":

* **Campaign Status**: ${status}
* **Outbound Funnel**: Dispatched: ${sent} | Delivered: ${delivered} (${deliveryRate}% delivery rate) | Failed: ${failed}
* **Engagement Funnel**: Opened: ${opened} (${openRate}% open rate) | Clicked: ${clicked} (${clickRate}% click-through rate) | Converted: ${converted} (${conversionRate}% conversion rate)

If you have specific questions about active segments or provider error codes, please verify that your channel delivery simulation is running.`;
  }
}
