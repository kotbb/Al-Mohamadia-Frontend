import type { AppNavigation, HistoryEntry, LeaveGuard } from "../types/navigation.types";
import { nextHistoryEntry, safeReturnPath, departingGuardKeys } from "./navigation-history";

/** Owns app history metadata only; never reads or changes Next's private state. */
export class AppHistory implements AppNavigation {
  private current: HistoryEntry;
  private guards = new Map<string, LeaveGuard & { layer: string | null }>();
  private layers = new Map<string, { back: () => void; restore?: () => void }>();
  private restoringFeatures = 0;
  private traversing = false;
  private pending: HistoryEntry | null = null;
  private restoration: (() => void) | null = null;
  private replay = false;
  private asking = false;
  private approving = false;
  private scopes = new Map<string, string | null>();
  private completed = new Map<string, string>();
  private disposed = false;
  private retired = new Set<string>();
  private registrations = new Map<string, symbol>();
  private key: string;
  constructor(
    private browser: Window,
    user: string,
    private navigate: (url: string, replace: boolean) => void,
    private confirm: (proceed: () => void, stay: () => void) => void,
    private localize: (url: string) => string = (url) => url,
  ) {
    this.key = `al-navigation-v1:${user}`;
    try {
      this.completed = new Map(JSON.parse(browser.sessionStorage.getItem(`${this.key}:completed`) ?? "[]"));
    } catch {
      /* Storage is optional. */
    }
    const stored = browser.history.state?.[this.key] as HistoryEntry | undefined;
    this.current = stored ?? { id: crypto.randomUUID(), position: 0, url: this.url(), source: null, layers: [] };
    // Dialog callbacks are in memory; a reload starts at its underlying route.
    this.current = { ...this.current, url: this.url() };
    this.write(this.current);
    browser.addEventListener("popstate", this.onPop, true);
    browser.addEventListener("beforeunload", this.onUnload);
    browser.addEventListener("click", this.onClick, true);
  }
  private url() {
    return this.browser.location.pathname + this.browser.location.search + this.browser.location.hash;
  }
  private write(entry: HistoryEntry) {
    this.browser.history.replaceState({ ...this.browser.history.state, [this.key]: entry }, "", entry.url);
    this.current = entry;
  }
  holdRestoration = () => {
    this.restoringFeatures++;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.restoringFeatures--;
        queueMicrotask(() => {
          if (!this.disposed) this.reconcileLayers();
        });
      }
    };
  };
  reconcileLayers = () => {
    if (this.restoringFeatures) return;
    const unknown = this.current.layers.filter((key) => !this.layers.has(key));
    if (unknown.length && this.current.position >= unknown.length) this.browser.history.go(-unknown.length);
  };
  commit = () => {
    if (this.pending) {
      // React can commit flushed search params while the destination is loading.
      // Never stamp that destination onto the physical source history entry.
      if (this.url() !== this.pending.url) return;
      this.write(this.pending);
      this.pending = null;
    } else if (this.url() !== this.current.url) this.write({ ...this.current, url: this.url() });
  };
  registerGuard = (key: string, guard: LeaveGuard) => {
    if (!this.scopes.has(key)) this.scopes.set(key, guard.layerKey ?? this.current.layers.at(-1) ?? null);
    this.guards.set(key, { ...guard, layer: guard.layerKey ?? this.scopes.get(key) ?? null });
    return () => {
      this.guards.delete(key);
    };
  };
  private check(action: () => void, guards = [...this.guards.values()]) {
    if (this.approving) {
      action();
      return;
    }
    if (this.asking || this.restoration || guards.some((guard) => guard.busy)) return;
    if (!guards.some((guard) => guard.dirty)) {
      action();
      return;
    }
    this.asking = true;
    this.confirm(
      () => {
        this.asking = false;
        this.approving = true;
        try {
          action();
        } finally {
          this.approving = false;
        }
      },
      () => {
        this.asking = false;
      },
    );
  }
  dismiss = (action: () => void) => {
    if (this.current.layers.length) this.back();
    else this.request(action);
  };
  request = (action: () => void) => this.check(action);
  private go(href: string, replace: boolean) {
    if (this.pending) return;
    const url = this.localize(safeReturnPath(href, "/"));
    if (url === this.url()) return;
    this.browser.dispatchEvent(new Event("app:before-navigation"));
    this.browser.dispatchEvent(new Event("app-navigation-leave"));
    this.current = { ...this.current, url: this.url() };
    this.pending = nextHistoryEntry(this.current, url, crypto.randomUUID(), replace);
    // A saved-result entry can browse another invoice using replace. Keep its
    // persisted destination current so Forward cannot revive the former result.
    if (replace && this.completed.has(this.current.id)) {
      this.completed.set(this.current.id, url);
      this.persistCompletions();
    }
    this.navigate(url, replace);
  }
  push = (href: string) => this.request(() => this.go(href, false));
  replace = (href: string) => this.request(() => this.go(href, true));
  private persistCompletions() {
    try {
      this.browser.sessionStorage.setItem(`${this.key}:completed`, JSON.stringify([...this.completed]));
    } catch {
      /* In-memory fallback. */
    }
  }
  complete = (href: string) => {
    if (this.pending || this.traversing || this.restoration) return;
    const result = this.localize(safeReturnPath(href, "/"));
    if (this.completed.get(this.current.id) === result && this.url() === result) return;
    this.guards.clear();
    this.completed.set(this.current.id, result);
    this.persistCompletions();
    // Only the actual detail entry from which this editor opened is redundant.
    // Its ID survives refresh and record browsing, unlike a URL equality check.
    if (this.current.source?.split(/[?#]/)[0] === result.split(/[?#]/)[0]) {
      this.current = { ...this.current, supersededDetailId: this.current.sourceEntryId };
    }
    this.go(result, true);
  };
  back = (fallback = "/") => {
    if (this.traversing || this.pending || this.asking || this.restoration) return;
    const params = new URLSearchParams(this.browser.location.search);
    if (this.current.position > 0) {
      this.traversing = true;
      this.browser.history.back();
    } else this.request(() => this.go(safeReturnPath(params.get("returnTo") ?? params.get("from"), fallback), true));
  };
  retireLayers = (keys: string[]) => {
    for (const key of keys) this.retired.add(key);
  };
  openLayer = (key: string, back: () => void, restore?: () => void) => {
    this.retired.delete(key);
    const registration = Symbol(key);
    this.registrations.set(key, registration);
    this.layers.set(key, { back, restore });
    if (!this.current.layers.includes(key)) {
      const entry = {
        ...this.current,
        id: crypto.randomUUID(),
        position: this.current.position + 1,
        layers: [...this.current.layers, key],
      };
      this.browser.history.pushState({ ...this.browser.history.state, [this.key]: entry }, "", this.url());
      this.current = entry;
    }
    return () => {
      // A save/programmatic close must also retire its browser-history layer.
      // Browser-driven close already updated current, so it does not traverse twice.
      queueMicrotask(() => {
        if (
          !this.disposed &&
          !this.pending &&
          !this.traversing &&
          this.url() === this.current.url &&
          this.registrations.get(key) === registration &&
          this.current.layers.includes(key)
        ) {
          this.retired.add(key);
          if (this.current.layers.at(-1) === key) this.browser.history.back();
        }
      });
    };
  };
  private onPop = (event: PopStateEvent) => {
    this.traversing = false;
    let target = event.state?.[this.key] as HistoryEntry | undefined;
    if (this.restoration) {
      event.stopImmediatePropagation();
      const restored = this.restoration;
      this.restoration = null;
      restored();
      return;
    }
    if (!target) return; // Cross-document exits use the browser's native unload guard.
    this.browser.dispatchEvent(new Event("app-navigation-leave"));
    target = { ...target, url: this.url() };
    const previous = this.current;
    if (target.layers.some((key) => this.retired.has(key))) {
      target = { ...target, layers: target.layers.filter((key) => !this.retired.has(key)) };
      this.write(target);
      if (target.position < previous.position && target.position > 0) {
        event.stopImmediatePropagation();
        this.browser.history.back();
        return;
      }
    }
    const routeChange = target.url.split(/[?#]/)[0] !== previous.url.split(/[?#]/)[0];
    const departing = departingGuardKeys(
      previous.layers,
      target.layers,
      [...this.guards.values()].map((guard) => guard.layer ?? "route"),
      routeChange,
    );
    const guards = [...this.guards.values()].filter((guard) => departing.includes(guard.layer ?? "route"));
    if (!this.replay && (this.asking || guards.some((guard) => guard.dirty || guard.busy))) {
      event.stopImmediatePropagation();
      const delta = target.position - previous.position;
      if (!delta) return;
      this.restoration = () =>
        this.check(() => {
          this.replay = true;
          this.browser.history.go(delta);
        }, guards);
      this.browser.history.go(-delta);
      return;
    }
    this.replay = false;
    this.current = target;
    if (
      target.id === previous.supersededDetailId &&
      target.position < previous.position &&
      target.position > 0 &&
      previous.layers.length === 0 &&
      target.layers.length === 0
    ) {
      event.stopImmediatePropagation();
      this.browser.history.back();
      return;
    }
    const result = this.completed.get(target.id);
    if (result && target.url !== result) {
      event.stopImmediatePropagation();
      this.go(result, true);
      return;
    }
    if (!routeChange) {
      if (target.url === previous.url) event.stopImmediatePropagation();
      for (const key of [...previous.layers].reverse()) if (!target.layers.includes(key)) this.layers.get(key)?.back();
      for (const key of target.layers) if (!previous.layers.includes(key)) this.layers.get(key)?.restore?.();
    }
  };
  private onUnload = (event: BeforeUnloadEvent) => {
    if ([...this.guards.values()].some((guard) => guard.dirty || guard.busy)) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  private onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element | null)?.closest?.("a");
    if (!link || link.hasAttribute("download") || link.target || link.getAttribute("aria-disabled") === "true") return;
    const url = new URL(link.href, this.browser.location.href);
    if (url.origin !== this.browser.location.origin || !["http:", "https:"].includes(url.protocol)) return;
    if (url.pathname === this.browser.location.pathname && url.search === this.browser.location.search && url.hash)
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const href = url.pathname + url.search + url.hash;
    if (link.dataset.navigationReplace === "true") this.replace(href);
    else this.push(href);
  };
  dispose = () => {
    this.disposed = true;
    this.browser.removeEventListener("popstate", this.onPop, true);
    this.browser.removeEventListener("beforeunload", this.onUnload);
    this.browser.removeEventListener("click", this.onClick, true);
  };
}
