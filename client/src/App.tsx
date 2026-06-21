import { useEffect, useState } from "react";
import { BuilderPanel } from "@/components/builder/BuilderPanel";
import { BundleLayout } from "@/components/layout/BundleLayout";
import { ReviewPanel } from "@/components/review/ReviewPanel";
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
  const [retryKey, setRetryKey] = useState(0);

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
  }, [retryKey]);

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto flex min-h-svh max-w-360 items-center justify-center bg-surface  font-sans"
      >
        <p role="status" className="text-sm font-medium text-text-body">
          Loading your security system…
        </p>
      </div>
    );
  }

  if (status === "error" || !bootData) {
    return (
      <div className="mx-auto flex min-h-svh max-w-360 items-center justify-center bg-surface px-15 font-sans">
        <div className="w-full max-w-md rounded-card border border-gray-400 bg-white p-20 text-center shadow-sm md:p-24">
          <p
            role="alert"
            className="text-sm font-medium text-red-600 md:text-base"
          >
            {errorMessage ??
              "Something went wrong while loading the bundle builder."}
          </p>
          <button
            type="button"
            onClick={() => {
              setBootData(null);
              setErrorMessage(null);
              setStatus("loading");
              setRetryKey((current) => current + 1);
            }}
            className="mt-16 inline-flex min-h-11 items-center justify-center rounded-button bg-brand px-20 py-12 font-button text-base font-bold leading-ui text-on-brand transition-opacity hover:opacity-90 active:opacity-80 md:min-h-12"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <BundleProvider
      catalog={bootData.catalog}
      configuration={bootData.configuration}
    >
      <BundleLayout builder={<BuilderPanel />} review={<ReviewPanel />} />
    </BundleProvider>
  );
}

export default App;
