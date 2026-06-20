import { useEffect, useState } from "react";
import { BundleLayout } from "@/components/layout/BundleLayout";
import { BundleProvider } from "@/state/bundleContext";
import { bootBundleConfiguration } from "@/state/bootBundle";
import type { BundleConfig } from "@/types/catalog";
import type { Configuration } from "@/types/configuration";

type BootStatus = "loading" | "error" | "ready";

type BootData = {
  catalog: BundleConfig;
  configuration: Configuration;
};

function App() {
  const [status, setStatus] = useState<BootStatus>("loading");
  const [bootData, setBootData] = useState<BootData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    bootBundleConfiguration()
      .then((data) => {
        if (!cancelled) {
          setBootData(data);
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load bundle builder",
          );
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-svh max-w-360 items-center justify-center bg-surface px-15 font-sans">
        <p className="text-sm font-medium text-text-body">
          Loading your security system…
        </p>
      </div>
    );
  }

  if (status === "error" || !bootData) {
    return (
      <div className="mx-auto flex min-h-svh max-w-360 items-center justify-center bg-surface px-15 font-sans">
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage ?? "Something went wrong. Please refresh the page."}
        </p>
      </div>
    );
  }

  return (
    <BundleProvider
      catalog={bootData.catalog}
      configuration={bootData.configuration}
    >
      <BundleLayout
        builder={
          <section
            aria-label="Bundle builder"
            className="rounded-card bg-step-bg p-15"
          >
            <p className="text-xs font-medium uppercase tracking-step-label text-text-muted">
              Step 1 of 4
            </p>
            <h1 className="mt-15 text-3xl font-semibold text-obsidian">
              Choose your cameras
            </h1>
            <p className="mt-8 text-sm font-medium text-text-body">
              Builder panel — Phase 6
            </p>
          </section>
        }
        review={
          <section
            aria-label="Your security system"
            className="rounded-card border border-gray-400 p-15"
          >
            <h2 className="text-lg font-semibold text-obsidian">
              Your security system
            </h2>
            <p className="mt-8 text-sm font-medium text-text-body">
              Review panel — Phase 7
            </p>
          </section>
        }
      />
    </BundleProvider>
  );
}

export default App;
