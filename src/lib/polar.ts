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

function normalizeBenefits(raw: any): PolarBenefit[] {
  const source = Array.isArray(raw?.benefits)
    ? raw.benefits
    : Array.isArray(raw?.attached_benefits)
      ? raw.attached_benefits
      : [];

  return source
    .map((entry: any, index: number) => {
      const benefit = entry?.benefit ?? entry;
      const description =
        benefit?.description ??
        benefit?.name ??
        benefit?.title ??
        entry?.description ??
        "";

      if (!description) return null;
      return {
        id: String(benefit?.id ?? entry?.id ?? `${raw?.id ?? "product"}-benefit-${index}`),
        description: String(description),
        type: String(benefit?.type ?? entry?.type ?? "feature"),
      } as PolarBenefit;
    })
    .filter(Boolean) as PolarBenefit[];
}

function normalizePrices(raw: any): PolarPrice[] {
  const prices = Array.isArray(raw?.prices) ? raw.prices : [];
  return prices.map((p: any, index: number) => ({
    id: String(p?.id ?? `${raw?.id ?? "product"}-price-${index}`),
    type: p?.type === "one_time" ? "one_time" : "recurring",
    amount_type: p?.amount_type ?? "fixed",
    price_amount: typeof p?.price_amount === "number" ? p.price_amount : null,
    price_currency: String(p?.price_currency ?? "USD"),
    recurring_interval: p?.recurring_interval,
  }));
}

function normalizeProduct(raw: any): PolarProduct {
  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? "Plan"),
    description: raw?.description ? String(raw.description) : null,
    is_recurring: Boolean(
      raw?.is_recurring || (Array.isArray(raw?.prices) && raw.prices.some((p: any) => p?.type === "recurring"))
    ),
    is_archived: Boolean(raw?.is_archived),
    prices: normalizePrices(raw),
    benefits: normalizeBenefits(raw),
  };
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

  const normalized = products.map(normalizeProduct);
  const recurring = normalized.filter(
    (p) => p.is_recurring || p.prices?.some((price) => price.type === "recurring")
  );

  return recurring.length > 0 ? recurring : normalized;
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
