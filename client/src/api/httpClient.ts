import { ApiError, NotFoundError } from "@/api/errors";

const API_BASE = "/api/v1";

type ErrorBody = {
  message?: string;
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody;
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // ignore non-JSON error bodies
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

/** fetch wrapper for `/api/v1/*` — maps 404 to {@link NotFoundError}. */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    if (response.status === 404) {
      throw new NotFoundError(message);
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}
