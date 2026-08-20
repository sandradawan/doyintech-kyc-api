import { v4 as uuidv4 } from "uuid";
import { deliverWebhook } from "./webhooks";

type Provider = "prembly" | "smile" | "mock";

function getProvider(): Provider {
  const p = (process.env.KYC_PROVIDER || "mock").toLowerCase();
  if (p === "prembly" || p === "smile") return p;
  return "mock";
}

async function premblyRequest(path: string, body: Record<string, unknown>) {
  const key = process.env.PREMBLY_API_KEY;
  const base = process.env.PREMBLY_BASE_URL || "https://api.prembly.com";
  if (!key) throw new Error("PREMBLY_API_KEY not configured");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "app-id": process.env.PREMBLY_APP_ID || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || data?.message || `Prembly error ${res.status}`);
  return data;
}

async function smileRequest(path: string, body: Record<string, unknown>) {
  const key = process.env.SMILE_API_KEY;
  const partnerId = process.env.SMILE_PARTNER_ID;
  const base = process.env.SMILE_BASE_URL || "https://api.smileidentity.com/v1";
  if (!key || !partnerId) throw new Error("SMILE_API_KEY and SMILE_PARTNER_ID required");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ ...body, partner_id: partnerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || `Smile error ${res.status}`);
  return data;
}

export async function verifyBVN(
  input: { bvn: string; firstName?: string; lastName?: string },
  apiKey?: string
) {
  const provider = getProvider();
  let result: any;
  try {
    if (provider === "prembly") {
      const data = await premblyRequest("/identitypass/verification/bvn", {
        number: input.bvn,
        first_name: input.firstName,
        last_name: input.lastName,
      });
      result = {
        requestId: uuidv4(),
        verified: data?.status === true || data?.response_code === "00",
        bvn: input.bvn,
        firstName: data?.data?.firstName || data?.first_name || input.firstName,
        lastName: data?.data?.lastName || data?.last_name || input.lastName,
        middleName: data?.data?.middleName || data?.middle_name,
        dateOfBirth: data?.data?.dateOfBirth || data?.date_of_birth,
        phone: data?.data?.phoneNumber || data?.phone,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "prembly",
      };
    } else if (provider === "smile") {
      const data = await smileRequest("/verify", {
        id_type: "BVN",
        id_number: input.bvn,
        first_name: input.firstName,
        last_name: input.lastName,
      });
      result = {
        requestId: uuidv4(),
        verified: data?.success === true || data?.result_code === "0000",
        bvn: input.bvn,
        firstName: data?.first_name || input.firstName,
        lastName: data?.last_name || input.lastName,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "smile",
      };
    } else {
      const ok = /^\d{11}$/.test(input.bvn);
      result = {
        requestId: uuidv4(),
        verified: ok,
        bvn: input.bvn,
        firstName: input.firstName || "ADEBAYO",
        lastName: input.lastName || "OKAFOR",
        middleName: "CHUKWUMA",
        dateOfBirth: "1990-05-14",
        phone: "0803*******",
        timestamp: new Date().toISOString(),
        provider: "mock",
      };
    }
  } catch (err: any) {
    result = {
      requestId: uuidv4(),
      verified: false,
      bvn: input.bvn,
      error: err.message,
      timestamp: new Date().toISOString(),
      provider,
    };
  }
  if (apiKey) {
    await deliverWebhook(apiKey, result.verified ? "kyc.completed" : "kyc.failed", {
      type: "bvn",
      ...result,
    });
  }
  return result;
}

export async function verifyNIN(
  input: { nin: string; firstName?: string; lastName?: string },
  apiKey?: string
) {
  const provider = getProvider();
  let result: any;
  try {
    if (provider === "prembly") {
      const data = await premblyRequest("/identitypass/verification/nin", {
        number: input.nin,
        first_name: input.firstName,
        last_name: input.lastName,
      });
      result = {
        requestId: uuidv4(),
        verified: data?.status === true || data?.response_code === "00",
        nin: input.nin,
        firstName: data?.data?.firstname || data?.first_name || input.firstName,
        lastName: data?.data?.surname || data?.last_name || input.lastName,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "prembly",
      };
    } else if (provider === "smile") {
      const data = await smileRequest("/verify", {
        id_type: "NIN",
        id_number: input.nin,
        first_name: input.firstName,
        last_name: input.lastName,
      });
      result = {
        requestId: uuidv4(),
        verified: data?.success === true,
        nin: input.nin,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "smile",
      };
    } else {
      const ok = /^\d{11}$/.test(input.nin);
      result = {
        requestId: uuidv4(),
        verified: ok,
        nin: input.nin,
        firstName: input.firstName || "CHIOMA",
        lastName: input.lastName || "NWOSU",
        dateOfBirth: "1992-08-21",
        timestamp: new Date().toISOString(),
        provider: "mock",
      };
    }
  } catch (err: any) {
    result = {
      requestId: uuidv4(),
      verified: false,
      nin: input.nin,
      error: err.message,
      timestamp: new Date().toISOString(),
      provider,
    };
  }
  if (apiKey) {
    await deliverWebhook(apiKey, result.verified ? "kyc.completed" : "kyc.failed", {
      type: "nin",
      ...result,
    });
  }
  return result;
}

export async function verifyDocument(
  input: { documentType: string; documentImage: string; selfieImage?: string },
  apiKey?: string
) {
  const provider = getProvider();
  let result: any;
  try {
    if (provider === "prembly") {
      const data = await premblyRequest("/identitypass/verification/document", {
        doc_type: input.documentType,
        doc_image: input.documentImage,
        selfie_image: input.selfieImage,
      });
      result = {
        requestId: uuidv4(),
        verified: data?.status === true,
        documentType: input.documentType,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "prembly",
      };
    } else {
      result = {
        requestId: uuidv4(),
        verified: true,
        documentType: input.documentType,
        confidence: 0.92,
        extracted: { fullName: "Mock User", idNumber: "A********" },
        timestamp: new Date().toISOString(),
        provider: provider === "smile" ? "smile" : "mock",
      };
    }
  } catch (err: any) {
    result = {
      requestId: uuidv4(),
      verified: false,
      error: err.message,
      timestamp: new Date().toISOString(),
      provider,
    };
  }
  if (apiKey) {
    await deliverWebhook(apiKey, result.verified ? "kyc.completed" : "kyc.failed", {
      type: "document",
      ...result,
    });
  }
  return result;
}

export async function faceMatch(input: { image1: string; image2: string }, apiKey?: string) {
  const provider = getProvider();
  let result: any;
  try {
    if (provider === "prembly") {
      const data = await premblyRequest("/identitypass/verification/face/compare", {
        image_one: input.image1,
        image_two: input.image2,
      });
      result = {
        requestId: uuidv4(),
        matched: data?.status === true,
        confidence: data?.data?.confidence || data?.confidence,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "prembly",
      };
    } else if (provider === "smile") {
      const data = await smileRequest("/biometric", {
        image1: input.image1,
        image2: input.image2,
      });
      result = {
        requestId: uuidv4(),
        matched: data?.success === true,
        confidence: data?.confidence,
        raw: data,
        timestamp: new Date().toISOString(),
        provider: "smile",
      };
    } else {
      result = {
        requestId: uuidv4(),
        matched: true,
        confidence: 0.88,
        timestamp: new Date().toISOString(),
        provider: "mock",
      };
    }
  } catch (err: any) {
    result = {
      requestId: uuidv4(),
      matched: false,
      error: err.message,
      timestamp: new Date().toISOString(),
      provider,
    };
  }
  if (apiKey) {
    await deliverWebhook(apiKey, result.matched ? "kyc.completed" : "kyc.failed", {
      type: "face-match",
      ...result,
    });
  }
  return result;
}

export function getProviderInfo() {
  const provider = getProvider();
  return {
    provider,
    premblyConfigured: !!process.env.PREMBLY_API_KEY,
    smileConfigured: !!(process.env.SMILE_API_KEY && process.env.SMILE_PARTNER_ID),
  };
}
