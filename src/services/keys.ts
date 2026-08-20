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

export function listKeys() {
  return Array.from(store.values()).map((r) => ({
    id: r.key,
    keyPreview: r.key.slice(0, 10) + "••••••••",
    name: r.name,
    plan: r.plan,
    monthlyLimit: r.monthlyLimit,
    usedThisMonth: r.usedThisMonth,
    remaining: r.monthlyLimit - r.usedThisMonth,
    active: r.active,
    createdAt: r.createdAt,
    lastUsedAt: r.lastUsedAt,
  }));
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

export function revokeKey(keyId: string): boolean {
  const record = store.get(keyId);
  if (!record) return false;
  record.active = false;
  store.set(keyId, record);
  return true;
}

export function activateKey(keyId: string): boolean {
  const record = store.get(keyId);
  if (!record) return false;
  record.active = true;
  store.set(keyId, record);
  return true;
}

export function deleteKey(keyId: string): boolean {
  if (keyId === "dev-key-123") return false;
  return store.delete(keyId);
}

export { plans };
