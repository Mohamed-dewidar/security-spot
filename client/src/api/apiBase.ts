/** Resolved API base URL — strips trailing slash. Requires `VITE_API_URL`. */
export function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (typeof configured !== "string" || configured.length === 0) {
    throw new Error(
      "VITE_API_URL is required when using the HTTP API. Set it in client/.env (see .env.example).",
    );
  }
  return configured.replace(/\/$/, "");
}
