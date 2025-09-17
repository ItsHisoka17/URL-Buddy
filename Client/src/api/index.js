const BASE = "/api";

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.message || res.statusText || "API Error");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function createGateway(payload) {
  const body = typeof payload === "string" ? { redirect: payload } : payload;
  return request("/createGateway", {
    method: "POST",
    body: JSON.stringify(body),
  });
;}
