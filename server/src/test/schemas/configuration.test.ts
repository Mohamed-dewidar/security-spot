import { describe, expect, it } from "vitest";
import {
  createConfigurationSchema,
  patchConfigurationSchema,
} from "../../schemas/configuration.js";

describe("createConfigurationSchema", () => {
  it("accepts an empty body", () => {
    expect(createConfigurationSchema.parse({})).toEqual({});
  });

  it("accepts optional selections, activeVariants, and openStepId", () => {
    const body = {
      openStepId: "plan",
      selections: { "wyze-cam-v4:white": 1, "wyze-cam-v4:black": 2 },
      activeVariants: { "wyze-cam-v4": "white" },
    };

    expect(createConfigurationSchema.parse(body)).toEqual(body);
  });

  it("rejects unknown top-level keys such as prices", () => {
    expect(() =>
      createConfigurationSchema.parse({ price: 99, total: 100 }),
    ).toThrow();
    expect(() =>
      createConfigurationSchema.parse({ selections: {}, unitPrice: 10 }),
    ).toThrow();
  });

  it("rejects negative or non-integer selection quantities", () => {
    expect(() =>
      createConfigurationSchema.parse({ selections: { "a:b": -1 } }),
    ).toThrow();
    expect(() =>
      createConfigurationSchema.parse({ selections: { "a:b": 1.5 } }),
    ).toThrow();
  });

  it("rejects empty selection or variant map keys", () => {
    expect(() =>
      createConfigurationSchema.parse({ selections: { "": 1 } }),
    ).toThrow();
    expect(() =>
      createConfigurationSchema.parse({ activeVariants: { "": "white" } }),
    ).toThrow();
  });
});

describe("patchConfigurationSchema", () => {
  it("accepts an empty patch", () => {
    expect(patchConfigurationSchema.parse({})).toEqual({});
  });

  it("accepts partial field updates", () => {
    expect(
      patchConfigurationSchema.parse({
        openStepId: "sensors",
        selections: { "wyze-sense-motion-sensor:default": 5 },
      }),
    ).toEqual({
      openStepId: "sensors",
      selections: { "wyze-sense-motion-sensor:default": 5 },
    });
  });

  it("rejects unknown keys and client-sent prices", () => {
    expect(() => patchConfigurationSchema.parse({ subtotal: 500 })).toThrow();
    expect(() =>
      patchConfigurationSchema.parse({
        selections: { "wyze-cam-v4:white": 1 },
        compareAtPrice: 79,
      }),
    ).toThrow();
  });
});
