import { describe, expect, it } from "vitest";
import { httpApi } from "@/api/implementations/http";

describe("httpApi", () => {
  it.each([
    "getConfig",
    "createConfiguration",
    "getConfiguration",
    "patchConfiguration",
    "saveConfiguration",
    "quote",
    "checkout",
  ] as const)(
    "rejects %s when the Express API is unavailable",
    async (method) => {
      const call = httpApi[method] as () => Promise<unknown>;
      await expect(call()).rejects.toThrow(/not available/i);
    },
  );
});
