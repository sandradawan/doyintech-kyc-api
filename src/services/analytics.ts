export interface UsageEvent {
  id: string;
  apiKey: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  meta?: Record<string, any>;
}

const events: UsageEvent[] = [];
const MAX_EVENTS = 10_000;

export function trackEvent(event: Omit<UsageEvent, "id" | "timestamp">) {
  const full: UsageEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  events.push(full);
  if (events.length > MAX_EVENTS) events.shift();
  return full;
}

export function getEventsForKey(apiKey: string, limit = 100) {
  return events.filter((e) => e.apiKey === apiKey).slice(-limit).reverse();
}

export function getSummary(apiKey?: string) {
  const filtered = apiKey ? events.filter((e) => e.apiKey === apiKey) : events;
  const byEndpoint: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let success = 0;
  let failed = 0;
  let totalLatency = 0;

  for (const e of filtered) {
    byEndpoint[e.endpoint] = (byEndpoint[e.endpoint] || 0) + 1;
    const day = e.timestamp.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
    if (e.statusCode >= 200 && e.statusCode < 400) success++;
    else failed++;
    totalLatency += e.latencyMs;
  }

  return {
    totalCalls: filtered.length,
    success,
    failed,
    avgLatencyMs: filtered.length ? Math.round(totalLatency / filtered.length) : 0,
    byEndpoint,
    byDay,
    last24h: filtered.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length,
  };
}

export function getRecent(limit = 50) {
  return events.slice(-limit).reverse();
}
