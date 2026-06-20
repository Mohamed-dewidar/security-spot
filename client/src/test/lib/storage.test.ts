import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSavedSnapshot,
  loadSavedSnapshot,
  parseSavedSnapshot,
  saveSnapshot,
} from "@/lib/storage";

beforeEach(() => {
  clearSavedSnapshot();
});

describe("parseSavedSnapshot", () => {
  it("accepts a valid snapshot shape", () => {
    expect(
      parseSavedSnapshot({
        configurationId: "cfg-1",
        openStepId: "cameras",
        selections: { "wyze-cam-v4:white": 1 },
        activeVariants: { "wyze-cam-v4": "white" },
      }),
    ).toEqual({
      configurationId: "cfg-1",
      openStepId: "cameras",
      selections: { "wyze-cam-v4:white": 1 },
      activeVariants: { "wyze-cam-v4": "white" },
    });
  });

  it("rejects invalid payloads", () => {
    expect(parseSavedSnapshot(null)).toBeNull();
    expect(parseSavedSnapshot({ openStepId: "cameras" })).toBeNull();
    expect(
      parseSavedSnapshot({
        openStepId: "cameras",
        selections: { "wyze-cam-v4:white": "one" },
        activeVariants: {},
      }),
    ).toBeNull();
  });
});

describe("storage round trip", () => {
  it("saves and loads a snapshot from localStorage", () => {
    saveSnapshot({
      configurationId: "cfg-abc",
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 2 },
      activeVariants: { "wyze-cam-v4": "black" },
    });

    expect(loadSavedSnapshot()).toEqual({
      configurationId: "cfg-abc",
      openStepId: "plan",
      selections: { "wyze-cam-v4:black": 2 },
      activeVariants: { "wyze-cam-v4": "black" },
    });
  });

  it("returns null for corrupt localStorage JSON", () => {
    localStorage.setItem("security-spot.bundle.snapshot", "{not-json");
    expect(loadSavedSnapshot()).toBeNull();
  });
});
