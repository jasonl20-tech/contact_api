export interface PolarProduct {
  id: string;
  name: string;
  description: string | null;
  is_recurring: boolean;
  is_archived: boolean;
  prices: PolarPrice[];
  benefits: PolarBenefit[];
}

interface PolarListResponse {
  items?: PolarProduct[];
  result?: {
    items?: PolarProduct[];
  };
  data?: PolarProduct[];
  pagination?: {
    next_cursor?: string | null;
  };
  next_cursor?: string | null;
}

function extractProducts(payload: unknown): PolarProduct[] {
  if (Array.isArray(payload)) return payload as PolarProduct[];
  if (!payload || typeof payload !== "object") return [];

  const p = payload as PolarListResponse;
  if (Array.isArray(p.items)) return p.items;
  if (Array.isArray(p.result?.items)) return p.result.items;
  if (Array.isArray(p.data)) return p.data;
  return [];
}

export interface PolarPrice {
  id: string;
  type: "one_time" | "recurring";
  amount_type: "fixed" | "custom" | "free";
  price_amount: number | null;
  price_currency: string;
  recurring_interval?: "month" | "year";
}

export interface PolarBenefit {
  id: string;
  description: string;
  type: string;
}

export async function getProducts(): Promise<PolarProduct[]> {
  const token = import.meta.env.POLAR_ACCESS_TOKEN;
  const orgId = import.meta.env.POLAR_ORGANIZATION_ID;

  if (!token || !orgId) return [];

  // Build-time fetch for static pricing page.
  // We fetch all active products and then detect subscriptions locally.
  const products: PolarProduct[] = [];
  let cursor: string | null = null;
  let pageGuard = 0;

  while (pageGuard < 20) {
    const url = new URL("https://api.polar.sh/v1/products/");
    url.searchParams.set("organization_id", orgId);
    url.searchParams.set("is_archived", "false");
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Polar API error:", response.status, await response.text());
      return [];
    }

    const data = (await response.json()) as PolarListResponse;
    const pageItems = extractProducts(data);
    products.push(...pageItems);

    cursor = data.pagination?.next_cursor ?? data.next_cursor ?? null;
    if (!cursor) break;
    pageGuard += 1;
  }

  const recurring = products.filter(
    (p) => p.is_recurring || p.prices?.some((price) => price.type === "recurring")
  );

  return recurring.length > 0 ? recurring : products;
}

export function formatPrice(price: PolarPrice): string {
  if (price.amount_type === "free") return "Kostenlos";
  if (price.amount_type === "custom") return "Individuell";
  if (price.price_amount == null) return "—";

  const amount = price.price_amount / 100;
  const currency = price.price_currency?.toUpperCase() ?? "USD";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  if (price.type === "recurring" && price.recurring_interval) {
    const interval = price.recurring_interval === "month" ? "mo" : "yr";
    return `${formatted}/${interval}`;
  }

  return formatted;
}
