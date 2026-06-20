import { BundleLayout } from "@/components/layout/BundleLayout";

function App() {
  return (
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
  );
}

export default App;
