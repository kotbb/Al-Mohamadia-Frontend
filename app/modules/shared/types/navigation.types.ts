export interface LeaveGuard {
  dirty: boolean;
  busy: boolean;
  layerKey?: string;
}
export interface HistoryEntry {
  id: string;
  position: number;
  url: string;
  source: string | null;
  sourceEntryId?: string;
  supersededDetailId?: string;
  layers: string[];
}
export interface AppNavigation {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: (fallback?: string) => void;
  complete: (href: string) => void;
  holdRestoration: () => () => void;
  retireLayers: (keys: string[]) => void;
  dismiss: (action: () => void) => void;
  request: (action: () => void) => void;
  registerGuard: (key: string, guard: LeaveGuard) => () => void;
  openLayer: (key: string, onBack: () => void, onRestore?: () => void) => () => void;
}
