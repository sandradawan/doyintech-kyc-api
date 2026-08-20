export interface PaymentRecord {
  id: string;
  reference: string;
  plan: string;
  amount: number;
  email: string;
  apiKey: string;
  status: "success" | "pending" | "failed";
  paidAt: string;
}

const history: PaymentRecord[] = [];

export function addPayment(p: Omit<PaymentRecord, "id">) {
  const rec: PaymentRecord = {
    ...p,
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  history.unshift(rec);
  if (history.length > 500) history.pop();
  return rec;
}

export function listPayments(apiKey?: string) {
  if (apiKey) return history.filter((h) => h.apiKey === apiKey);
  return history;
}
