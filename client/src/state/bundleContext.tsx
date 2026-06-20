/* Context module exports provider and hooks together — see COMPONENTS.md */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import { saveSnapshot } from "@/lib/storage";
import {
  bundleReducer,
  createInitialState,
  type BundleAction,
  type BundleState,
} from "@/state/bundleReducer";
import {
  createConfigurationSyncController,
  type ConfigurationSyncController,
} from "@/sync/optimisticSync";
import type { BundleConfig } from "@/types/catalog";
import type { Configuration } from "@/types/configuration";

type BundleContextValue = {
  catalog: BundleConfig;
  configurationId: string;
  state: BundleState;
  dispatch: Dispatch<BundleAction>;
  saveForLater: () => Promise<void>;
};

const BundleContext = createContext<BundleContextValue | null>(null);

type BundleProviderProps = {
  catalog: BundleConfig;
  configuration: Configuration;
  children: ReactNode;
};

export function BundleProvider({
  catalog,
  configuration,
  children,
}: BundleProviderProps) {
  const [state, dispatch] = useReducer(
    bundleReducer,
    configuration,
    createInitialState,
  );
  const skipSyncRef = useRef(true);
  const syncRef = useRef<ConfigurationSyncController>(
    createConfigurationSyncController(configuration.id),
  );

  useEffect(() => {
    syncRef.current.cancel();
    syncRef.current = createConfigurationSyncController(configuration.id);
    skipSyncRef.current = true;
  }, [configuration.id]);

  useEffect(() => {
    return () => syncRef.current.cancel();
  }, []);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    syncRef.current.schedule(state);
  }, [state]);

  const saveForLater = useCallback(async () => {
    saveSnapshot({
      configurationId: configuration.id,
      selections: state.selections,
      activeVariants: state.activeVariants,
      openStepId: state.openStepId,
    });
    await api.saveConfiguration(configuration.id);
  }, [configuration.id, state]);

  const value = useMemo<BundleContextValue>(
    () => ({
      catalog,
      configurationId: configuration.id,
      state,
      dispatch,
      saveForLater,
    }),
    [catalog, configuration.id, state, saveForLater],
  );

  return (
    <BundleContext.Provider value={value}>{children}</BundleContext.Provider>
  );
}

function useBundleContext(): BundleContextValue {
  const context = useContext(BundleContext);
  if (!context) {
    throw new Error("Bundle hooks must be used within BundleProvider");
  }
  return context;
}

export function useBundle(): BundleContextValue {
  return useBundleContext();
}

export function useBundleState(): BundleState {
  return useBundleContext().state;
}

export function useBundleDispatch(): Dispatch<BundleAction> {
  return useBundleContext().dispatch;
}

export function useBundleCatalog(): BundleConfig {
  return useBundleContext().catalog;
}
