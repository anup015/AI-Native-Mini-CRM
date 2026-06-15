import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const TARGET_CUSTOMERS = 5_000;
const TARGET_ORDERS = 20_000;
const BATCH_SIZE = 500;
const SEED = 20260611;

const cities = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Gurugram",
  "Noida",
  "Jaipur",
  "Kochi"
];

const categories = [
  "skincare",
  "sneakers",
  "coffee",
  "electronics",
  "fashion",
  "home",
  "beauty",
  "fitness",
  "appliances",
  "grocery"
];

const productPatterns: Record<string, string[]> = {
  skincare: ["cleanser", "moisturizer", "serum", "sunscreen", "face mask", "toner"],
  sneakers: ["running shoes", "retro sneakers", "basketball shoes", "trainer", "slip-on"],
  coffee: ["arabica beans", "cold brew", "espresso pods", "coffee grinder", "mug set"],
  electronics: ["wireless earbuds", "tablet", "smartwatch", "monitor", "keyboard"],
  fashion: ["overshirt", "denim", "hoodie", "joggers", "t-shirt"],
  home: ["desk lamp", "storage box", "sheet set", "chair", "organizer"],
  beauty: ["lip tint", "foundation", "eyeliner", "palette", "primer"],
  fitness: ["yoga mat", "dumbbells", "resistance bands", "shaker bottle", "tracker"],
  appliances: ["air fryer", "blender", "vacuum", "microwave", "kettle"],
  grocery: ["snack pack", "protein bar", "granola", "tea box", "pasta bundle"]
};

const behaviorProfiles = {
  inactive: {
    weight: 0.12,
    spendRange: [0, 1200] as const,
    orderCountRange: [0, 1] as const,
    tags: ["inactive", "winback", "low-engagement"],
    channels: ["EMAIL", "SMS"] as const,
    cityBias: ["tier2", "tier3"] as const,
    categoryBias: ["grocery", "home", "electronics"] as const,
    seasonality: 0.55,
    aovBias: 0.7
  },
  loyal: {
    weight: 0.22,
    spendRange: [9000, 45000] as const,
    orderCountRange: [4, 10] as const,
    tags: ["loyal", "repeat-customer", "high-engagement"],
    channels: ["WHATSAPP", "EMAIL"] as const,
    cityBias: ["metro"] as const,
    categoryBias: ["fashion", "beauty", "electronics", "coffee"] as const,
    seasonality: 1.2,
    aovBias: 1.1
  },
  luxury: {
    weight: 0.1,
    spendRange: [25000, 180000] as const,
    orderCountRange: [2, 7] as const,
    tags: ["luxury", "high-aov", "vip"],
    channels: ["WHATSAPP", "EMAIL"] as const,
    cityBias: ["metro"] as const,
    categoryBias: ["electronics", "fashion", "beauty", "home"] as const,
    seasonality: 1.35,
    aovBias: 2.4
  },
  discount: {
    weight: 0.2,
    spendRange: [1500, 18000] as const,
    orderCountRange: [3, 9] as const,
    tags: ["discount-shopper", "promo-responsive", "deal-seeker"],
    channels: ["SMS", "EMAIL"] as const,
    cityBias: ["tier2", "tier3", "metro"] as const,
    categoryBias: ["grocery", "home", "fashion", "beauty"] as const,
    seasonality: 1.5,
    aovBias: 0.85
  },
  skincare: {
    weight: 0.15,
    spendRange: [2500, 28000] as const,
    orderCountRange: [3, 8] as const,
    tags: ["skincare-buyer", "routine-driven", "beauty-loyalist"],
    channels: ["EMAIL", "WHATSAPP"] as const,
    cityBias: ["metro"] as const,
    categoryBias: ["skincare", "beauty" ] as const,
    seasonality: 1.25,
    aovBias: 1.0
  },
  sneaker: {
    weight: 0.13,
    spendRange: [4000, 36000] as const,
    orderCountRange: [3, 8] as const,
    tags: ["sneaker-enthusiast", "streetwear", "drop-watcher"],
    channels: ["EMAIL", "WHATSAPP"] as const,
    cityBias: ["metro"] as const,
    categoryBias: ["sneakers", "fashion", "electronics"] as const,
    seasonality: 1.18,
    aovBias: 1.15
  },
  coffee: {
    weight: 0.08,
    spendRange: [1800, 22000] as const,
    orderCountRange: [2, 7] as const,
    tags: ["coffee-lover", "subscription-prone", "morning-routine"],
    channels: ["EMAIL", "SMS"] as const,
    cityBias: ["metro", "tier2"] as const,
    categoryBias: ["coffee", "grocery", "home"] as const,
    seasonality: 1.1,
    aovBias: 0.95
  }
} as const;

type BehaviorKey = keyof typeof behaviorProfiles;
type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  gender: "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "UNKNOWN";
  age: number | null;
  tags: string[];
  preferredChannel: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  totalSpend: Prisma.Decimal;
  lastOrderDate: Date | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  behaviorType: BehaviorKey;
  orderCount: number;
};

type OrderRow = {
  id: string;
  customerId: string;
  amount: Prisma.Decimal;
  category: string;
  items: Prisma.InputJsonValue;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  purchaseDate: Date;
};

function weightedPick<T extends string | number>(entries: Array<[T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = faker.number.float({ min: 0, max: total });
  for (const [value, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) {
      return value;
    }
  }
  return entries[entries.length - 1][0];
}

function choose<T>(values: readonly T[]): T {
  return values[faker.number.int({ min: 0, max: values.length - 1 })];
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function pickCity(bias: readonly string[]) {
  const metroCities = ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Gurugram", "Noida"];
  const tier2Cities = ["Jaipur", "Kochi", "Ahmedabad", "Kolkata"];

  if (bias.includes("metro")) return choose(metroCities);
  if (bias.includes("tier2")) return choose(tier2Cities);
  return choose(cities);
}

function pickGender(): CustomerRow["gender"] {
  return weightedPick([
    ["FEMALE", 0.39],
    ["MALE", 0.4],
    ["NON_BINARY", 0.03],
    ["OTHER", 0.02],
    ["UNKNOWN", 0.16]
  ]);
}

function pickChannel(channels: readonly CustomerRow["preferredChannel"][]) {
  return choose(channels);
}

function pickOrderDate(year: number, seasonality = 1) {
  const monthWeights: Array<[number, number]> = [
    [1, 0.75],
    [2, 0.85],
    [3, 0.9],
    [4, 0.95],
    [5, 1.0],
    [6, 1.05],
    [7, 1.1],
    [8, 1.08],
    [9, 1.0],
    [10, 1.08],
    [11, 1.25 * seasonality],
    [12, 1.45 * seasonality]
  ] as const;

  const month = weightedPick(monthWeights);
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = faker.number.int({ min: 1, max: daysInMonth });
  const hour = faker.number.int({ min: 8, max: 21 });
  const minute = faker.number.int({ min: 0, max: 59 });
  const second = faker.number.int({ min: 0, max: 59 });

  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function generateItemSet(category: string) {
  const patterns = productPatterns[category] ?? ["standard item"];
  const count = faker.number.int({ min: 1, max: 4 });
  return Array.from({ length: count }, () => ({
    sku: `${category.slice(0, 3)}-${faker.string.alphanumeric(6).toLowerCase()}`,
    name: choose(patterns),
    quantity: faker.number.int({ min: 1, max: 3 }),
    unitPrice: faker.number.int({ min: 199, max: 19999 })
  }));
}

function behaviorForCustomer(index: number): BehaviorKey {
  const distribution: Array<[BehaviorKey, number]> = [
    ["inactive", behaviorProfiles.inactive.weight],
    ["loyal", behaviorProfiles.loyal.weight],
    ["luxury", behaviorProfiles.luxury.weight],
    ["discount", behaviorProfiles.discount.weight],
    ["skincare", behaviorProfiles.skincare.weight],
    ["sneaker", behaviorProfiles.sneaker.weight],
    ["coffee", behaviorProfiles.coffee.weight]
  ];

  return weightedPick(distribution);
}

function buildCustomer(index: number): CustomerRow {
  const behaviorType = behaviorForCustomer(index);
  const profile = behaviorProfiles[behaviorType];
  const city = pickCity(profile.cityBias);
  const age = weightedPick<number>([
    [18, 0.05],
    [22, 0.12],
    [26, 0.18],
    [31, 0.2],
    [36, 0.18],
    [42, 0.12],
    [50, 0.1],
    [58, 0.08],
    [66, 0.05]
  ]);
  const orderCount = faker.number.int({ min: profile.orderCountRange[0], max: profile.orderCountRange[1] });
  const totalSpendValue = faker.number.float({ min: profile.spendRange[0], max: profile.spendRange[1] });
  const baseTags = new Set<string>(profile.tags);

  if (behaviorType === "inactive") {
    baseTags.add(faker.helpers.arrayElement(["churn-risk", "dormant", "re-engagement"]));
  }

  if (behaviorType === "luxury") {
    baseTags.add(faker.helpers.arrayElement(["high-aov", "premium", "concierge-ready"]));
  }

  if (behaviorType === "discount") {
    baseTags.add(faker.helpers.arrayElement(["coupon-user", "flash-sale", "bargain-hunter"]));
  }

  const gender = pickGender();
  const emailName = faker.internet.userName({ firstName: faker.person.firstName(), lastName: faker.person.lastName() });
  const createdAt = faker.date.between({ from: new Date("2024-01-01T00:00:00.000Z"), to: new Date("2026-06-01T00:00:00.000Z") });
  const lastOrderDate =
    orderCount === 0
      ? null
      : pickOrderDate(
          faker.number.int({ min: 2024, max: 2026 }),
          profile.seasonality
        );

  return {
    id: randomUUID(),
    name: faker.person.fullName({ sex: gender === "FEMALE" ? "female" : gender === "MALE" ? "male" : undefined }),
    email: `${emailName}.${index}@example.com`.toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    city,
    gender,
    age,
    tags: Array.from(baseTags),
    preferredChannel: pickChannel(profile.channels),
    totalSpend: new Prisma.Decimal(totalSpendValue.toFixed(2)),
    lastOrderDate,
    ownerId: null,
    createdAt,
    updatedAt: createdAt,
    behaviorType,
    orderCount
  };
}

function getOrderBounds(behaviorType: BehaviorKey) {
  const profile = behaviorProfiles[behaviorType];

  return {
    min: profile.orderCountRange[0],
    max: behaviorType === "inactive" ? 2 : profile.orderCountRange[1] + 4
  };
}

function normalizeOrderCounts(customers: CustomerRow[]) {
  let totalOrders = customers.reduce((sum, customer) => sum + customer.orderCount, 0);

  while (totalOrders < TARGET_ORDERS) {
    const candidates = customers.filter((customer) => customer.behaviorType !== "inactive" && customer.orderCount < getOrderBounds(customer.behaviorType).max);

    if (candidates.length === 0) {
      throw new Error("Unable to increase order counts to reach the target order total.");
    }

    const customer = choose(candidates);
    customer.orderCount += 1;
    totalOrders += 1;
  }

  while (totalOrders > TARGET_ORDERS) {
    const candidates = customers.filter((customer) => customer.orderCount > getOrderBounds(customer.behaviorType).min);

    if (candidates.length === 0) {
      throw new Error("Unable to reduce order counts to reach the target order total.");
    }

    const customer = choose(candidates);
    customer.orderCount -= 1;
    totalOrders -= 1;
  }
}

function buildOrdersForCustomer(customer: CustomerRow): OrderRow[] {
  const profile = behaviorProfiles[customer.behaviorType];
  const orders: OrderRow[] = [];

  if (customer.orderCount === 0) {
    return orders;
  }

  const primaryCategory = choose(profile.categoryBias);
  const averageOrderValue = clamp(180, customer.totalSpend.toNumber() / customer.orderCount, 25000);
  const annualSpread = customer.behaviorType === "inactive" ? 0.35 : 1;
  const usableYears = customer.behaviorType === "inactive" ? [2024, 2025] : [2024, 2025, 2026];

  for (let orderIndex = 0; orderIndex < customer.orderCount; orderIndex += 1) {
    const category = orderIndex === 0 ? primaryCategory : choose(categories);
    const seasonBoost = customer.behaviorType === "discount" ? 1.25 : customer.behaviorType === "luxury" ? 1.4 : 1;
    const orderYear = choose(usableYears);
    const purchaseDate = pickOrderDate(orderYear, profile.seasonality * seasonBoost * annualSpread);
    const valueJitter = faker.number.float({ min: 0.45, max: 1.75 });
    const amount = clamp(129, averageOrderValue * valueJitter, customer.behaviorType === "luxury" ? 65000 : 18000);
    const status = weightedPick([
      ["COMPLETED", 0.56],
      ["PAID", 0.18],
      ["SHIPPED", 0.12],
      ["PENDING", 0.06],
      ["CANCELLED", customer.behaviorType === "discount" ? 0.05 : 0.03],
      ["REFUNDED", customer.behaviorType === "inactive" ? 0.06 : 0.02]
    ]);

    orders.push({
      id: randomUUID(),
      customerId: customer.id,
      amount: new Prisma.Decimal(amount.toFixed(2)),
      category,
      items: {
        category,
        products: generateItemSet(category),
        source: customer.preferredChannel,
        behaviorType: customer.behaviorType,
        seasonalFlag: purchaseDate.getUTCMonth() === 10 || purchaseDate.getUTCMonth() === 11 ? "holiday" : "standard"
      },
      status,
      purchaseDate
    });
  }

  return orders;
}

async function truncateAll() {
  await prisma.$transaction([
    prisma.webhookEvent.deleteMany(),
    prisma.communicationLog.deleteMany(),
    prisma.campaignAnalytics.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.customerSegment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.segment.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

async function seedUsers() {
  const creator = await prisma.user.create({
    data: {
      name: "Avery Chen",
      email: "avery@example.com",
      role: "MANAGER"
    }
  });

  await prisma.user.createMany({
    data: [
      { id: randomUUID(), name: "Nina Patel", email: "nina@example.com", role: "SALES" },
      { id: randomUUID(), name: "Owen Blake", email: "owen@example.com", role: "ANALYST" }
    ]
  });

  return creator;
}

async function seedSegmentsAndCampaigns(customers: CustomerRow[], creatorId: string) {
  const behaviorGroups: Array<{ name: string; description: string; behaviorTypes: BehaviorKey[]; rule: Record<string, unknown> }> = [
    {
      name: "High Value Loyalists",
      description: "Customers with repeated purchases and strong spend",
      behaviorTypes: ["loyal", "luxury"],
      rule: { tags: ["loyal", "vip", "high-aov"], minTotalSpend: 9000 }
    },
    {
      name: "Winback Candidates",
      description: "Inactive users with churn risk",
      behaviorTypes: ["inactive"],
      rule: { tags: ["inactive", "dormant", "churn-risk"], maxLastOrderDays: 120 }
    },
    {
      name: "Promo Responsive Shoppers",
      description: "Customers likely to react to offers and discounts",
      behaviorTypes: ["discount", "coffee"],
      rule: { tags: ["promo-responsive", "coupon-user", "deal-seeker"] }
    },
    {
      name: "Beauty and Self-Care",
      description: "Skincare and beauty buyers for personalization demos",
      behaviorTypes: ["skincare"],
      rule: { categories: ["skincare", "beauty"] }
    }
  ];

  for (const group of behaviorGroups) {
    const segmentCustomers = customers.filter((customer) => group.behaviorTypes.includes(customer.behaviorType)).slice(0, 250);
    const segment = await prisma.segment.create({
      data: {
        name: group.name,
        description: group.description,
        rules: group.rule as Prisma.InputJsonValue,
        customerCount: segmentCustomers.length,
        lastComputedAt: new Date(),
        createdById: creatorId,
        customers: {
          create: segmentCustomers.map((customer) => ({ customerId: customer.id }))
        }
      }
    });

    const sent = faker.number.int({ min: 1200, max: 8200 });
    const delivered = Math.floor(sent * faker.number.float({ min: 0.84, max: 0.97 }));
    const failed = sent - delivered;
    const opened = Math.floor(delivered * faker.number.float({ min: 0.18, max: 0.48 }));
    const clicked = Math.floor(opened * faker.number.float({ min: 0.12, max: 0.38 }));
    const converted = Math.floor(clicked * faker.number.float({ min: 0.08, max: 0.28 }));

    const campaign = await prisma.campaign.create({
      data: {
        title: `${group.name} - Q2 Growth Blast`,
        audienceId: segment.id,
        channel: choose(["EMAIL", "SMS", "WHATSAPP"]),
        message: `Personalized offer for ${group.name.toLowerCase()} with dynamic product recommendations.`,
        status: "COMPLETED",
        scheduledAt: faker.date.recent({ days: 45 }),
        createdById: creatorId
      }
    });

    await prisma.campaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        sent,
        delivered,
        failed,
        opened,
        clicked,
        converted
      }
    });

    const sampleCustomers = segmentCustomers.slice(0, Math.min(75, segmentCustomers.length));
    const logs = sampleCustomers.map((customer) => {
      const purchaseInfluence = faker.number.float({ min: 0.2, max: 0.95 });
      const status = weightedPick([
        ["DELIVERED", 0.55],
        ["OPENED", 0.22],
        ["CLICKED", 0.12],
        ["FAILED", 0.11]
      ]);
      return {
        campaignId: campaign.id,
        customerId: customer.id,
        channel: campaign.channel,
        status,
        providerMessageId: randomUUID(),
        messageSnapshot: campaign.message,
        errorMessage: status === "FAILED" ? "Delivery provider timeout" : null,
        metadata: {
          segment: group.name,
          purchaseInfluence,
          recommendedCategory: choose(categories)
        },
        sentAt: faker.date.recent({ days: 35 }),
        deliveredAt: status === "FAILED" ? null : faker.date.recent({ days: 30 }),
        openedAt: status === "OPENED" || status === "CLICKED" ? faker.date.recent({ days: 20 }) : null,
        clickedAt: status === "CLICKED" ? faker.date.recent({ days: 15 }) : null
      };
    });

    await prisma.communicationLog.createMany({ data: logs });

    await prisma.webhookEvent.createMany({
      data: logs.slice(0, 20).map((log) => ({
        source: "channel-service",
        eventType: `${log.status.toLowerCase()}.update`,
        providerEventId: randomUUID(),
        campaignId: campaign.id,
        customerId: log.customerId,
        status: log.status === "FAILED" ? "FAILED" : "PROCESSED",
        payload: {
          providerMessageId: log.providerMessageId,
          status: log.status.toLowerCase(),
          segment: group.name
        },
        processedAt: log.status === "FAILED" ? null : new Date(),
        errorMessage: log.status === "FAILED" ? "Provider rejected payload" : null
      }))
    });
  }
}

async function main() {
  faker.seed(SEED);

  await truncateAll();

  const creator = await seedUsers();
  const customers: CustomerRow[] = [];

  for (let index = 0; index < TARGET_CUSTOMERS; index += 1) {
    customers.push(buildCustomer(index));
  }

  normalizeOrderCounts(customers);

  for (let offset = 0; offset < customers.length; offset += BATCH_SIZE) {
    const batch = customers.slice(offset, offset + BATCH_SIZE).map(({ behaviorType, orderCount, ...customer }) => customer);
    await prisma.customer.createMany({ data: batch });
    process.stdout.write(`Inserted customers ${Math.min(offset + BATCH_SIZE, TARGET_CUSTOMERS)}/${TARGET_CUSTOMERS}\r`);
  }
  process.stdout.write("\n");

  const orders: OrderRow[] = [];
  for (const customer of customers) {
    orders.push(...buildOrdersForCustomer(customer));
  }

  for (let offset = 0; offset < orders.length; offset += BATCH_SIZE) {
    const batch = orders.slice(offset, offset + BATCH_SIZE);
    await prisma.order.createMany({ data: batch });
    process.stdout.write(`Inserted orders ${Math.min(offset + BATCH_SIZE, orders.length)}/${orders.length}\r`);
  }
  process.stdout.write("\n");

  await prisma.customer.updateMany({
    data: {
      ownerId: creator.id
    }
  });

  await seedSegmentsAndCampaigns(customers, creator.id);

  const sampledInactive = customers.filter((customer) => customer.behaviorType === "inactive").slice(0, 5);
  const sampledLuxury = customers.filter((customer) => customer.behaviorType === "luxury").slice(0, 5);

  await prisma.lead.createMany({
    data: [
      ...sampledInactive.map((customer) => ({
        name: customer.name,
        email: customer.email.replace("@example.com", ".lead@example.com"),
        company: `${customer.city ?? "Metro"} Holdings`,
        value: 1500,
        stage: "NEW",
        ownerId: creator.id
      })),
      ...sampledLuxury.map((customer) => ({
        name: customer.name,
        email: customer.email.replace("@example.com", ".viplead@example.com"),
        company: `${customer.city ?? "Metro"} Private`,
        value: 24000,
        stage: "QUALIFIED",
        ownerId: creator.id
      }))
    ]
  });

  console.log({
    customers: TARGET_CUSTOMERS,
    orders: orders.length,
    behaviors: Object.keys(behaviorProfiles),
    categories,
    cities
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
