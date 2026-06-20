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
      <BundleLayout builder={<BuilderPanel />} review={<ReviewPanel />} />
    </BundleProvider>
  );
}

export default App;
