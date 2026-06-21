import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import bundle from "@/data/bundle.json";
import {
  resetLocalApiStore,
  seedLocalConfiguration,
} from "@/api/implementations/local";
import { clearSavedSnapshot, loadSavedSnapshot } from "@/lib/storage";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { BundleProvider } from "@/state/bundleContext";
import type { BundleConfig } from "@/types/catalog";
import type { Configuration } from "@/types/configuration";

const catalog = bundle as BundleConfig;

function renderReviewPanel(configuration: Configuration) {
  seedLocalConfiguration(configuration);
  return render(
    <BundleProvider catalog={catalog} configuration={configuration}>
      <ReviewPanel />
    </BundleProvider>,
  );
}

describe("ReviewPanel", () => {
  beforeEach(() => {
    resetLocalApiStore();
    clearSavedSnapshot();
  });

  it("renders grouped review lines from initial selections", () => {
    const configuration: Configuration = {
      id: "cfg-review",
      ...catalog.initialSelections,
    };

    renderReviewPanel(configuration);

    expect(
      screen.getByRole("heading", { name: "Your security system" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cameras" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wyze Cam v4")).toBeInTheDocument();
    expect(screen.getByText("Wyze Cam Pan v3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
  });

  it("syncs review stepper changes with reducer state", () => {
    const configuration: Configuration = {
      id: "cfg-review-qty",
      ...catalog.initialSelections,
    };

    renderReviewPanel(configuration);

    const line = screen.getByTestId("review-line-wyze-cam-v4:white");
    const quantity = line.querySelector('[aria-live="polite"]');

    expect(quantity).toHaveTextContent("1");

    fireEvent.click(
      line.querySelector(
        '[aria-label="Increase Wyze Cam v4 — White quantity"]',
      ) as HTMLButtonElement,
    );

    expect(quantity).toHaveTextContent("2");
  });

  it("persists snapshot when save for later is clicked", async () => {
    const configuration: Configuration = {
      id: "cfg-review-save",
      ...catalog.initialSelections,
    };

    renderReviewPanel(configuration);

    fireEvent.click(
      screen.getByRole("button", { name: "Save my system for later" }),
    );

    await waitFor(() => {
      expect(loadSavedSnapshot()).toEqual({
        configurationId: "cfg-review-save",
        ...catalog.initialSelections,
      });
    });
    expect(
      screen.getByRole("button", { name: "Saved for later" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your system was saved for later."),
    ).toBeInTheDocument();
  });

  it("shows checkout placeholder alert", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const configuration: Configuration = {
      id: "cfg-review-checkout",
      ...catalog.initialSelections,
    };

    renderReviewPanel(configuration);
    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Checkout is not available in this demo.",
    );

    alertSpy.mockRestore();
  });
});
