import { useEffect, useRef } from 'react';

export interface PeaceverseHistoryState {
  pvInit?: boolean;
  pvBase?: boolean;
  pvDepth: number;
  pvToken: string;
  pvKind: 'root' | 'nav' | 'modal';
  pvPath?: string;
  pvTab?: string;
  pvLabel?: string;
}

interface ModalBackEntry {
  token: string;
  depth: number;
  label: string;
  onClose: () => void;
}

type RouteSyncHandler = (state: PeaceverseHistoryState) => void;

let seqCounter = 0;
const modalStack: ModalBackEntry[] = [];
const closedByPopTokens = new Set<string>();
let pendingUiBackSteps = 0;
let microtaskScheduled = false;
let suppressedPopCount = 0;
let listenerAttached = false;
let routeSyncHandler: RouteSyncHandler | null = null;

function nextToken(prefix: string): string {
  seqCounter += 1;
  return `${prefix}-${Date.now()}-${seqCounter}`;
}

export function getCurrentHistoryDepth(): number {
  if (typeof window === 'undefined') return 0;
  const s = window.history.state as PeaceverseHistoryState | null;
  return typeof s?.pvDepth === 'number' ? s.pvDepth : 0;
}

function flushPendingUiBack(): void {
  if (microtaskScheduled || typeof window === 'undefined') return;
  microtaskScheduled = true;
  queueMicrotask(() => {
    microtaskScheduled = false;
    if (pendingUiBackSteps > 0) {
      const steps = pendingUiBackSteps;
      pendingUiBackSteps = 0;
      suppressedPopCount += 1;
      try {
        window.history.go(-steps);
      } catch {
        suppressedPopCount = Math.max(0, suppressedPopCount - 1);
      }
    }
  });
}

function handleGlobalPopState(event: PopStateEvent): void {
  const nextState = ((event.state || window.history.state || {}) as Partial<PeaceverseHistoryState>);
  const targetDepth = typeof nextState.pvDepth === 'number' ? nextState.pvDepth : 0;

  if (suppressedPopCount > 0) {
    suppressedPopCount -= 1;
    if (routeSyncHandler && (nextState.pvPath !== undefined || nextState.pvTab !== undefined)) {
      routeSyncHandler({
        pvInit: nextState.pvInit,
        pvBase: nextState.pvBase,
        pvDepth: targetDepth,
        pvToken: nextState.pvToken || 'root',
        pvKind: nextState.pvKind || 'nav',
        pvPath: nextState.pvPath,
        pvTab: nextState.pvTab,
        pvLabel: nextState.pvLabel,
      });
    }
    return;
  }

  // Close open modals/drawers whose pushed depth exceeds targetDepth in strict LIFO order
  let closedAnyModal = false;
  while (modalStack.length > 0) {
    const top = modalStack[modalStack.length - 1];
    if (top.depth > targetDepth) {
      modalStack.pop();
      closedByPopTokens.add(top.token);
      closedAnyModal = true;
      try {
        top.onClose();
      } catch {
        // ignore close callback errors
      }
    } else {
      break;
    }
  }

  // Sync top-level route and tab state
  if (routeSyncHandler) {
    if (nextState.pvPath !== undefined || nextState.pvTab !== undefined) {
      routeSyncHandler({
        pvInit: nextState.pvInit,
        pvBase: nextState.pvBase,
        pvDepth: targetDepth,
        pvToken: nextState.pvToken || 'root',
        pvKind: nextState.pvKind || 'nav',
        pvPath: nextState.pvPath,
        pvTab: nextState.pvTab,
        pvLabel: nextState.pvLabel,
      });
    } else if (!closedAnyModal) {
      routeSyncHandler({
        pvDepth: targetDepth,
        pvToken: nextState.pvToken || 'root',
        pvKind: 'root',
        pvPath: window.location.pathname || '/',
        pvTab: 'home',
      });
    }
  }
}

export function ensureBackNavigationListener(): void {
  if (typeof window === 'undefined' || listenerAttached) return;
  listenerAttached = true;
  window.addEventListener('popstate', handleGlobalPopState);
}

export function registerRouteSyncHandler(handler: RouteSyncHandler): () => void {
  ensureBackNavigationListener();
  routeSyncHandler = handler;
  return () => {
    if (routeSyncHandler === handler) {
      routeSyncHandler = null;
    }
  };
}

/**
 * Ensures the app starts with a clean base Home entry at depth 0 so pressing Back
 * from deeper tabs/routes always lands on Home before ever exiting the app.
 */
export function initHistoryBase(path: string, tab: string, isAuthenticated: boolean): void {
  if (typeof window === 'undefined') return;
  ensureBackNavigationListener();

  const cur = window.history.state as PeaceverseHistoryState | null;
  if (cur && cur.pvInit) return;

  const basePath = isAuthenticated ? '/home' : '/';
  const baseState: PeaceverseHistoryState = {
    pvInit: true,
    pvBase: true,
    pvDepth: 0,
    pvToken: 'root',
    pvKind: 'root',
    pvPath: basePath,
    pvTab: 'home',
    pvLabel: 'home',
  };

  const curFull = window.location.pathname + window.location.search + window.location.hash;
  const needsExtraEntry =
    (isAuthenticated && tab !== 'home') ||
    (path !== '/' && path !== '/home');

  if (needsExtraEntry) {
    window.history.replaceState(baseState, '', basePath);
    const topState: PeaceverseHistoryState = {
      pvInit: true,
      pvBase: false,
      pvDepth: 1,
      pvToken: nextToken('nav'),
      pvKind: 'nav',
      pvPath: path,
      pvTab: tab,
      pvLabel: `${path}:${tab}`,
    };
    window.history.pushState(topState, '', curFull);
  } else {
    window.history.replaceState(
      { ...baseState, pvPath: path, pvTab: tab },
      '',
      curFull
    );
  }
}

/**
 * Resets history root to Home (/home) at depth 0 (for example right after login)
 * so pressing Back from deeper pages stops at Home before exiting the app.
 */
export function resetHistoryToHome(homePath = '/home'): void {
  if (typeof window === 'undefined') return;
  ensureBackNavigationListener();
  modalStack.length = 0;
  closedByPopTokens.clear();
  pendingUiBackSteps = 0;

  const baseState: PeaceverseHistoryState = {
    pvInit: true,
    pvBase: true,
    pvDepth: 0,
    pvToken: 'root',
    pvKind: 'root',
    pvPath: homePath,
    pvTab: 'home',
    pvLabel: 'home',
  };
  window.history.replaceState(baseState, '', homePath);
}

/**
 * Push a new tab or route entry into window.history (Facebook-style Back history).
 */
export function pushAppNavigation(path: string, tab: string, nextUrl: string): void {
  if (typeof window === 'undefined') return;
  ensureBackNavigationListener();

  const cur = (window.history.state || {}) as Partial<PeaceverseHistoryState>;
  const token = nextToken('nav');

  // If a modal was just closed in the same action and we're navigating forward,
  // or if top of history was a modal being replaced by this route, reuse slot cleanly.
  if (pendingUiBackSteps > 0) {
    pendingUiBackSteps -= 1;
    const replaced: PeaceverseHistoryState = {
      pvInit: true,
      pvBase: false,
      pvDepth: getCurrentHistoryDepth(),
      pvToken: token,
      pvKind: 'nav',
      pvPath: path,
      pvTab: tab,
      pvLabel: `${path}:${tab}`,
    };
    window.history.replaceState(replaced, '', nextUrl);
    return;
  }

  if (cur.pvKind === 'modal') {
    const replaced: PeaceverseHistoryState = {
      pvInit: true,
      pvBase: false,
      pvDepth: getCurrentHistoryDepth(),
      pvToken: token,
      pvKind: 'nav',
      pvPath: path,
      pvTab: tab,
      pvLabel: `${path}:${tab}`,
    };
    window.history.replaceState(replaced, '', nextUrl);
    return;
  }

  const nextDepth = getCurrentHistoryDepth() + 1;
  const pushed: PeaceverseHistoryState = {
    pvInit: true,
    pvBase: false,
    pvDepth: nextDepth,
    pvToken: token,
    pvKind: 'nav',
    pvPath: path,
    pvTab: tab,
    pvLabel: `${path}:${tab}`,
  };
  window.history.pushState(pushed, '', nextUrl);
}

/**
 * Trigger an in-app Back navigation synchronized with browser history / Android hardware Back.
 */
export function goAppBack(fallbackHome: () => void): void {
  if (typeof window === 'undefined') {
    fallbackHome();
    return;
  }
  ensureBackNavigationListener();

  if (modalStack.length > 0 || getCurrentHistoryDepth() > 0) {
    window.history.back();
  } else {
    fallbackHome();
  }
}

/**
 * React hook: Registers any open modal, drawer, popup, dropdown, or nested sub-view
 * in window.history.pushState so Android hardware Back closes it one step at a time
 * without exiting the app.
 */
export function useHistoryBack(
  isOpen: boolean,
  onClose: () => void,
  label = 'modal'
): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    ensureBackNavigationListener();

    const token = nextToken('modal');
    const curState = (window.history.state || {}) as Partial<PeaceverseHistoryState>;
    let entryDepth: number;

    if (pendingUiBackSteps > 0) {
      pendingUiBackSteps -= 1;
      entryDepth = getCurrentHistoryDepth();
      const replaced: PeaceverseHistoryState = {
        ...curState,
        pvInit: true,
        pvDepth: entryDepth,
        pvToken: token,
        pvKind: 'modal',
        pvLabel: label,
      };
      window.history.replaceState(replaced, '', window.location.href);
    } else {
      entryDepth = getCurrentHistoryDepth() + 1;
      const pushed: PeaceverseHistoryState = {
        ...curState,
        pvInit: true,
        pvBase: false,
        pvDepth: entryDepth,
        pvToken: token,
        pvKind: 'modal',
        pvLabel: label,
      };
      window.history.pushState(pushed, '', window.location.href);
    }

    const entry: ModalBackEntry = {
      token,
      depth: entryDepth,
      label,
      onClose: () => onCloseRef.current(),
    };
    modalStack.push(entry);

    return () => {
      const idx = modalStack.findIndex((m) => m.token === token);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
      }

      if (closedByPopTokens.has(token)) {
        closedByPopTokens.delete(token);
        return;
      }

      const topState = window.history.state as PeaceverseHistoryState | null;
      if (topState && topState.pvKind === 'modal' && topState.pvDepth >= entryDepth) {
        pendingUiBackSteps += 1;
        flushPendingUiBack();
      }
    };
  }, [isOpen, label]);
}
