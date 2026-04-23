import { GoogleGenAI } from "@google/genai";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrCode(err) {
  return (
    err?.status ||
    err?.response?.status ||
    err?.cause?.code ||
    err?.code ||
    err?.cause?.errno ||
    err?.errno ||
    null
  );
}

function parseGeminiErrorPayload(err) {
  const msg = err?.message;
  if (typeof msg !== "string") return null;
  const trimmed = msg.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && parsed.error) return parsed;
    return null;
  } catch {
    return null;
  }
}

function isTransientNetworkError(err) {
  const code = getErrCode(err);
  return (
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED"
  );
}

export function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const e = new Error("GEMINI_API_KEY is not set");
    e.code = "AI_NOT_CONFIGURED";
    throw e;
  }
  return new GoogleGenAI({ apiKey });
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

export async function withAiRetry(fn, { retries = 2, baseDelayMs = 500 } = {}) {
  let attempt = 0;
  // total attempts = retries + 1
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isTransientNetworkError(err)) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }
}

export function toAiHttpError(err) {
  const payload = parseGeminiErrorPayload(err);
  const apiCode = payload?.error?.code;
  const apiStatus = payload?.error?.status;

  const code = getErrCode(err);
  if (err?.code === "AI_NOT_CONFIGURED") {
    return { status: 500, message: "AI is not configured", detail: err.message };
  }
  if (err?.status === 401 || err?.status === 403) {
    return { status: 502, message: "AI authentication/permission failed", detail: err?.message || "AUTH_ERROR" };
  }
  if (err?.status === 429) {
    return { status: 429, message: "AI quota exceeded", detail: err?.message || "QUOTA_EXCEEDED" };
  }
  if (apiCode === 404 || apiStatus === "NOT_FOUND") {
    return {
      status: 502,
      message: "AI model is not available",
      detail: payload ? JSON.stringify(payload) : err?.message || "MODEL_NOT_FOUND",
    };
  }
  if (apiCode === 429 || apiStatus === "RESOURCE_EXHAUSTED") {
    return {
      status: 429,
      message: "AI quota exceeded",
      detail: payload ? JSON.stringify(payload) : err?.message || "QUOTA_EXCEEDED",
    };
  }
  if (apiCode === 401 || apiStatus === "UNAUTHENTICATED") {
    return {
      status: 502,
      message: "AI authentication failed",
      detail: payload ? JSON.stringify(payload) : err?.message || "UNAUTHENTICATED",
    };
  }
  if (apiCode === 403 || apiStatus === "PERMISSION_DENIED") {
    return {
      status: 502,
      message: "AI permission denied",
      detail: payload ? JSON.stringify(payload) : err?.message || "PERMISSION_DENIED",
    };
  }
  if (isTransientNetworkError(err)) {
    return {
      status: 503,
      message: "AI service is unreachable (network/DNS)",
      detail: code ? String(code) : "NETWORK_ERROR",
    };
  }
  return {
    status: 500,
    message: "AI request failed",
    detail: payload ? JSON.stringify(payload) : (err?.message ? String(err.message) : "UNKNOWN_ERROR"),
  };
}

