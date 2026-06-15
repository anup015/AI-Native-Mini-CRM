export type CustomerGender = "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "UNKNOWN";
export type PreferredChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export type CustomerOrder = {
  id: string;
  amount: string;
  category: string;
  status: string;
  purchaseDate: string;
  itemCount: number;
};

export type CustomerListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  gender: CustomerGender;
  age: number | null;
  tags: string[];
  preferredChannel: PreferredChannel;
  totalSpend: string;
  lastOrderDate: string | null;
  createdAt: string;
  ordersCount: number;
  ordersValue: string;
};

export type CustomerListResponse = {
  customers: CustomerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  analytics: {
    totalCustomers: number;
    activeCustomers: number;
    highValueCustomers: number;
    avgSpend: string;
    topCity: string | null;
  };
};

export type CustomerDetail = CustomerListItem & {
  insights: {
    label: string;
    value: string;
  }[];
  orderHistory: CustomerOrder[];
};

export type CustomerAnalyticsResponse = {
  totalCustomers: number;
  activeCustomers: number;
  highValueCustomers: number;
  avgSpend: number;
  byCity: Array<{ city: string; customers: number; spend: number }>;
  byChannel: Array<{ channel: PreferredChannel; customers: number; spend: number }>;
  byGender: Array<{ gender: CustomerGender; customers: number; avgAge: number }>;
  topTags: Array<{ tag: string; count: number }>;
};

export type CustomerFilterOptions = {
  cities: string[];
  tags: string[];
  genders: CustomerGender[];
  preferredChannels: PreferredChannel[];
};
