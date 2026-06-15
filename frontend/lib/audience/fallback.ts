import { SegmentCondition, SegmentRule } from "@/lib/audience/types";

const cityMap = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Gurugram", "Noida", "Jaipur", "Kochi"];

function extractNumber(input: string, pattern: RegExp) {
  const match = input.match(pattern);
  return match ? Number(match[1]) : null;
}

function ensureCondition(rule: SegmentRule, condition: SegmentCondition) {
  rule.conditions.push(condition);
}

export function buildFallbackRule(prompt: string): { rule: SegmentRule | null; explanation: string } {
  const text = prompt.toLowerCase();
  const rule: SegmentRule = { logic: "AND", conditions: [] };
  const notes: string[] = [];

  const city = cityMap.find((candidate) => text.includes(candidate.toLowerCase()));
  if (city) {
    ensureCondition(rule, { field: "city" as const, operator: "=" as const, value: city });
    notes.push(`city = ${city}`);
  }

  if (/female|women|woman|female customers/.test(text)) {
    ensureCondition(rule, { field: "gender" as const, operator: "=" as const, value: "FEMALE" });
    notes.push("gender = FEMALE");
  }

  if (/male|men|man/.test(text) && !/female|women|woman/.test(text)) {
    ensureCondition(rule, { field: "gender" as const, operator: "=" as const, value: "MALE" });
    notes.push("gender = MALE");
  }

  if (/inactive|dormant|churn|cold/.test(text)) {
    ensureCondition(rule, { field: "lastOrderDays" as const, operator: ">=" as const, value: 90 });
    notes.push("lastOrderDays >= 90");
  }

  const spend = extractNumber(text, /spent more than\s+(\d+(?:\.\d+)?)/i) ?? extractNumber(text, /spend(?:ed)? more than\s+(\d+(?:\.\d+)?)/i) ?? extractNumber(text, /more than\s+(\d+(?:\.\d+)?)/i);
  const days = extractNumber(text, /last\s+(\d+)\s+days/i);

  if (spend != null) {
    const spendCondition = days
      ? { field: "recentSpend" as const, operator: ">=" as const, value: spend, lookbackDays: days }
      : { field: "totalSpend" as const, operator: ">=" as const, value: spend };
    ensureCondition(rule, spendCondition);
    notes.push(days ? `recentSpend >= ${spend} / ${days}d` : `totalSpend >= ${spend}`);
  }

  if (/repeat buyers|repeat customers|loyal|high value/.test(text)) {
    ensureCondition(rule, { field: "ordersCount" as const, operator: ">=" as const, value: 2 });
    notes.push("ordersCount >= 2");
  }

  if (/skincare/.test(text)) {
    ensureCondition(rule, { field: "orderCategory" as const, operator: "=" as const, value: "skincare" });
    notes.push("orderCategory = skincare");
  }

  if (/sneaker/.test(text)) {
    ensureCondition(rule, { field: "orderCategory" as const, operator: "=" as const, value: "sneakers" });
    notes.push("orderCategory = sneakers");
  }

  if (/coffee/.test(text)) {
    ensureCondition(rule, { field: "orderCategory" as const, operator: "=" as const, value: "coffee" });
    notes.push("orderCategory = coffee");
  }

  if (/discount|deal|coupon|promo/.test(text)) {
    ensureCondition(rule, { field: "tags" as const, operator: "hasAny" as const, value: ["discount-shopper", "promo-responsive", "deal-seeker", "coupon-user"] });
    notes.push("tags hasAny promo cluster");
  }

  if (/whatsapp/.test(text)) {
    ensureCondition(rule, { field: "preferredChannel" as const, operator: "=" as const, value: "WHATSAPP" });
    notes.push("preferredChannel = WHATSAPP");
  }

  if (/email/.test(text)) {
    ensureCondition(rule, { field: "preferredChannel" as const, operator: "=" as const, value: "EMAIL" });
    notes.push("preferredChannel = EMAIL");
  }

  if (!rule.conditions.length) {
    return {
      rule: null,
      explanation: "I could not infer a safe audience from that prompt. Try adding city, spend, category, or recency terms."
    };
  }

  return {
    rule,
    explanation: `Fallback interpretation: ${notes.join(" AND ")}`
  };
}
