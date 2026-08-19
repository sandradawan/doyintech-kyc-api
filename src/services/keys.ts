/**
 * Simple in-memory API key store + usage tracking
 * In production → replace with PostgreSQL / Redis
 */

export interface ApiKeyRecord {
  key: string;
  name: string;
  plan: "starter" | "growth" | "business" | "enterprise";
  monthlyLimit: number;
  usedThisMonth: number;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

const plans = {
  starter: { limit: 500, price: 15000 },
  growth: { limit: 2000, price: 45000 },
  business: { limit: 10000, price: 120000 },
  enterprise: { limit: 999999, price: 0 },
};

const store = new Map<string, ApiKeyRecord>();

store.set("dev-key-123", {
  key: "dev-key-123",
  name: "Development Key",
  plan: "growth",
  monthlyLimit: 2000,
  usedThisMonth: 0,
  active: true,
  createdAt: new Date().toISOString(),
});

export function validateAndTrack(apiKey: string): { ok: boolean; error?: string; record?: ApiKeyRecord } {
  const record = store.get(apiKey);
  if (!record) return { ok: false, error: "Invalid API key" };
  if (!record.active) return { ok: false, error: "API key is disabled" };
  if (record.usedThisMonth >= record.monthlyLimit) {
    return { ok: false, error: "Monthly quota exceeded. Upgrade your plan." };
  }
  record.usedThisMonth += 1;
  record.lastUsedAt = new Date().toISOString();
  store.set(apiKey, record);
  return { ok: true, record };
}

export function getKeyInfo(apiKey: string) {
  return store.get(apiKey) || null;
}

export function createKey(name: string, plan: keyof typeof plans = "starter") {
  const key = `dt_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const record: ApiKeyRecord = {
    key,
    name,
    plan,
    monthlyLimit: plans[plan].limit,
    usedThisMonth: 0,
    active: true,
    createdAt: new Date().toISOString(),
  };
  store.set(key, record);
  return record;
}

export { plans };
