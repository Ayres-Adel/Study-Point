function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(err) {
  const code = err?.cause?.code || err?.code;
  return (
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED"
  );
}

export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const e = new Error("OPENROUTER_API_KEY is not set");
    e.code = "AI_NOT_CONFIGURED";
    throw e;
  }
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct";
  const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost";
  const appName = process.env.OPENROUTER_APP_NAME || "studygenie";
  return { apiKey, model, baseUrl, siteUrl, appName };
}

export async function withRetry(fn, { retries = 2, baseDelayMs = 500 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isTransientNetworkError(err)) throw err;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
}

export async function openRouterChatCompletion({
  messages,
  model,
  temperature = 0.2,
  maxTokens = 700,
  timeoutMs = 45000,
}) {
  const cfg = getOpenRouterConfig();
  const res = await withRetry(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": cfg.siteUrl,
        "X-Title": cfg.appName,
      },
      body: JSON.stringify({
        model: model || cfg.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    }).finally(() => clearTimeout(timer));
  });

  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // ignore
  }

  if (!res.ok) {
    const e = new Error(typeof data === "object" && data ? JSON.stringify(data) : text);
    e.status = res.status;
    throw e;
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    null;

  return { raw: data, content: typeof content === "string" ? content : "" };
}

