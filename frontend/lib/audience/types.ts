import { z } from "zod";

export const SEGMENT_FIELDS = [
  "city",
  "gender",
  "preferredChannel",
  "tags",
  "age",
  "totalSpend",
  "lastOrderDate",
  "lastOrderDays",
  "ordersCount",
  "recentSpend",
  "orderCategory"
] as const;

export const SEGMENT_OPERATORS = ["=", "!=", ">", ">=", "<", "<=", "contains", "in", "notIn", "has", "hasAny", "hasEvery"] as const;
export const SEGMENT_LOGICS = ["AND", "OR"] as const;

export type SegmentField = (typeof SEGMENT_FIELDS)[number];
export type SegmentOperator = (typeof SEGMENT_OPERATORS)[number];
export type SegmentLogic = (typeof SEGMENT_LOGICS)[number];

export type SegmentCondition = {
  field: SegmentField;
  operator: SegmentOperator;
  value?: string | number | boolean | string[] | number[] | null;
  lookbackDays?: number;
  label?: string;
};

export type SegmentGroup = {
  logic: SegmentLogic;
  conditions: SegmentNode[];
  label?: string;
};

export type SegmentNode = SegmentCondition | SegmentGroup;
export type SegmentRule = SegmentGroup;

export const segmentConditionSchema = z.object({
  field: z.enum(SEGMENT_FIELDS),
  operator: z.enum(SEGMENT_OPERATORS),
  value: z.any().optional(),
  lookbackDays: z.coerce.number().int().positive().max(3650).optional(),
  label: z.string().trim().max(120).optional()
}).superRefine((condition, context) => {
  const unaryOperators = new Set(["has", "hasAny", "hasEvery"]);
  const operatorsWithoutValue = new Set(["has", "hasAny", "hasEvery"]);
  const operatorsExpectingArray = new Set(["in", "notIn", "hasAny", "hasEvery"]);
  const operatorsExpectingNumber = new Set([">", ">=", "<", "<=", "="]);

  if (operatorsWithoutValue.has(condition.operator)) {
    return;
  }

  if (condition.value == null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This condition requires a value.",
      path: ["value"]
    });
    return;
  }

  if (operatorsExpectingArray.has(condition.operator) && !Array.isArray(condition.value)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This operator expects an array value.",
      path: ["value"]
    });
  }

  if (operatorsExpectingNumber.has(condition.operator) && typeof condition.value !== "number" && typeof condition.value !== "string") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This operator expects a number or numeric string.",
      path: ["value"]
    });
  }

  if (condition.field === "recentSpend" || condition.field === "ordersCount") {
    if (condition.lookbackDays != null && condition.lookbackDays <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "lookbackDays must be greater than zero.",
        path: ["lookbackDays"]
      });
    }
  }
});

export type SegmentConditionInput = z.infer<typeof segmentConditionSchema>;

// eslint-disable-next-line prefer-const
let segmentNodeSchema: z.ZodType<SegmentNode>;

const segmentGroupSchemaBase = z.object({
  logic: z.enum(SEGMENT_LOGICS),
  conditions: z.array(z.lazy(() => segmentNodeSchema)).min(1),
  label: z.string().trim().max(120).optional()
});

export const segmentGroupSchema: z.ZodType<SegmentGroup> = z.lazy(() => segmentGroupSchemaBase) as z.ZodType<SegmentGroup>;
segmentNodeSchema = z.union([segmentConditionSchema, segmentGroupSchema]) as z.ZodType<SegmentNode>;

export const segmentRuleSchema = segmentGroupSchema;
export const segmentGenerationSchema = z.object({
  prompt: z.string().trim().min(8).max(500)
});

export const segmentSaveSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(240).optional(),
  rule: segmentRuleSchema
});

export type SegmentGenerationInput = z.infer<typeof segmentGenerationSchema>;
export type SegmentSaveInput = z.infer<typeof segmentSaveSchema>;
