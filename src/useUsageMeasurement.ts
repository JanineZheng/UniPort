import { useEffect, useRef, useState } from 'react';
import { UsageTracker } from './core/measurement';
import type { InputOrigin, UsageEvent } from './core/measurement';
import type { Tool } from './config/toolOrder';

type Context = { tool: Tool; locale: 'en' | 'zh'; enabled: boolean };
export function sendUsageEvent(event: UsageEvent, origin: InputOrigin, context: Context) {
  if (!context.enabled || typeof window === 'undefined' || window.location.protocol === 'chrome-extension:') return;
  try {
    if (new URLSearchParams(window.location.search).get('unitport_internal') === '1' || sessionStorage.getItem('uniport.analytics.internal') === '1') return;
  } catch { /* Unavailable storage must not interrupt the tool. */ }
  const parameters = { tool_id: context.tool, ui_language: context.locale, input_origin: origin, measurement_version: '1' };
  // Local QA can observe sanitized events without loading Google Analytics.
  window.dispatchEvent(new CustomEvent('uniport:measurement', { detail: { event, parameters } }));
  if (window.location.hostname !== 'uniport.janine-cheng22.workers.dev') return;
  const analytics = window as Window & { gtag?: (...args: unknown[]) => void };
  try { analytics.gtag?.('event', event, parameters); } catch { /* Analytics is optional. */ }
}

export function useUsageMeasurement(context: Context, valid: boolean, resultKey: string) {
  const latest = useRef(context);
  latest.current = context;
  const tracker = useRef<UsageTracker | null>(null);
  if (!tracker.current) tracker.current = new UsageTracker((event, origin) => sendUsageEvent(event, origin, latest.current));
  const [revision, setRevision] = useState(0);
  function changed(origin: 'example' | 'user' = 'user') {
    tracker.current!.change(origin);
    setRevision(tracker.current!.revision);
  }
  function adjusted() {
    tracker.current!.adjust();
    setRevision(tracker.current!.revision);
  }
  useEffect(() => {
    const snapshot = tracker.current!.snapshot(valid);
    const timer = window.setTimeout(() => tracker.current!.settle(snapshot), 800);
    return () => window.clearTimeout(timer);
  }, [revision, valid, resultKey]);
  async function recordCopy(action: () => Promise<boolean>) {
    const snapshot = tracker.current!.snapshot(valid);
    tracker.current!.settle(snapshot);
    let success = false;
    try { success = await action(); } catch { /* Clipboard failure is reported below. */ }
    tracker.current!.copy(snapshot, success);
    return success;
  }
  return { changed, adjusted, recordCopy };
}
