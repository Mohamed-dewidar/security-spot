import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, NotFoundError } from "@/api/errors";
import { httpApi } from "@/api/implementations/http";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockFetch.mockReset();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("httpApi.getConfig", () => {
  it("fetches catalog from /api/v1/config", async () => {
    const catalog = { meta: { currency: "USD" }, steps: [] };
    mockFetch.mockResolvedValue(jsonResponse(catalog));

    const result = await httpApi.getConfig();

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/config", {
      headers: new Headers(),
    });
    expect(result).toEqual(catalog);
  });
});

describe("httpApi.createConfiguration", () => {
  it("POSTs optional input to /api/v1/configurations", async () => {
    const configuration = { id: "cfg-1", selections: {}, activeVariants: {} };
    mockFetch.mockResolvedValue(jsonResponse(configuration, 201));

    const result = await httpApi.createConfiguration({
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 2 },
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/configurations", {
      method: "POST",
      body: JSON.stringify({
        openStepId: "plan",
        selections: { "wyze-cam-v4:black": 2 },
      }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(result).toEqual(configuration);
  });
});

describe("httpApi.getConfiguration", () => {
  it("throws NotFoundError on 404", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: "Configuration not found: missing" }, 404),
    );

    await expect(httpApi.getConfiguration("missing")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/configurations/missing", {
      headers: new Headers(),
    });
  });
});

describe("httpApi.patchConfiguration", () => {
  it("PATCHes partial updates", async () => {
    const configuration = {
      id: "cfg-1",
      selections: { "wyze-cam-v4:white": 3 },
    };
    mockFetch.mockResolvedValue(jsonResponse(configuration));

    const result = await httpApi.patchConfiguration("cfg-1", {
      selections: { "wyze-cam-v4:white": 3 },
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/configurations/cfg-1", {
      method: "PATCH",
      body: JSON.stringify({ selections: { "wyze-cam-v4:white": 3 } }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(result).toEqual(configuration);
  });
});

describe("httpApi.saveConfiguration", () => {
  it("POSTs to the save endpoint without a body", async () => {
    const configuration = { id: "cfg-1", savedAt: "2026-01-01T00:00:00.000Z" };
    mockFetch.mockResolvedValue(jsonResponse(configuration));

    await httpApi.saveConfiguration("cfg-1");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/configurations/cfg-1/save",
      {
        method: "POST",
        headers: new Headers(),
      },
    );
  });
});

describe("httpApi.quote", () => {
  it("POSTs to the quote endpoint", async () => {
    const quote = { configurationId: "cfg-1", total: 100 };
    mockFetch.mockResolvedValue(jsonResponse(quote));

    const result = await httpApi.quote("cfg-1");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/configurations/cfg-1/quote",
      {
        method: "POST",
        headers: new Headers(),
      },
    );
    expect(result).toEqual(quote);
  });
});

describe("httpApi.checkout", () => {
  it("throws ApiError for non-404 failures", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: "Validation failed" }, 400),
    );

    await expect(httpApi.checkout("cfg-1")).rejects.toBeInstanceOf(ApiError);
  });
});
