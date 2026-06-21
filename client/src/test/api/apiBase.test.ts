import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBase } from "@/api/apiBase";

describe("getApiBase", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when VITE_API_URL is unset", () => {
    vi.stubEnv("VITE_API_URL", "");
    expect(() => getApiBase()).toThrow(/VITE_API_URL is required/);
  });

  it("uses VITE_API_URL when set", () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com/api/v1");
    expect(getApiBase()).toBe("https://api.example.com/api/v1");
  });

  it("strips a trailing slash from VITE_API_URL", () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3001/api/v1/");
    expect(getApiBase()).toBe("http://localhost:3001/api/v1");
  });
});
