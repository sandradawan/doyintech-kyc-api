export interface WebhookConfig {
  apiKey: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  updatedAt: string;
}

const configs = new Map<string, WebhookConfig>();

export function setWebhook(apiKey: string, url: string, events: string[] = ["kyc.completed", "kyc.failed"]) {
  const secret = `whsec_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const cfg: WebhookConfig = {
    apiKey,
    url,
    events,
    active: true,
    secret,
    updatedAt: new Date().toISOString(),
  };
  configs.set(apiKey, cfg);
  return cfg;
}

export function getWebhook(apiKey: string) {
  return configs.get(apiKey) || null;
}

export function deleteWebhook(apiKey: string) {
  return configs.delete(apiKey);
}

export async function deliverWebhook(apiKey: string, event: string, payload: any) {
  const cfg = configs.get(apiKey);
  if (!cfg || !cfg.active || !cfg.events.includes(event)) return;
  try {
    await fetch(cfg.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DoyinTech-Event": event,
        "X-DoyinTech-Signature": cfg.secret,
      },
      body: JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.error("[webhook] delivery failed", e);
  }
}
