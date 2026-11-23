import test from 'node:test';
import assert from 'node:assert/strict';
import { UsageTracker } from '../src/core/measurement.ts';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function setup() {
  const events: string[] = [];
  const tracker = new UsageTracker((event, origin) => events.push(`${event}:${origin}`));
  return { tracker, events };
}
test('default and example copies never qualify as effective use', () => {
  const { tracker, events } = setup();
  tracker.settle(tracker.snapshot(true));
  tracker.copy(tracker.snapshot(true), true);
  tracker.change('example');
  tracker.copy(tracker.snapshot(true), true);
  assert.deepEqual(events, ['copy_success:initial', 'example_use:example', 'copy_success:example']);
});
test('unit selection alone does not turn default data into user input', () => {
  const { tracker, events } = setup();
  tracker.adjust();
  tracker.copy(tracker.snapshot(true), true);
  assert.deepEqual(events, ['copy_success:initial']);
});
test('invalid inputs and failed clipboard writes cannot qualify', () => {
  const { tracker, events } = setup();
  tracker.change('user');
  tracker.settle(tracker.snapshot(false));
  tracker.copy(tracker.snapshot(false), true);
  tracker.copy(tracker.snapshot(true), false);
  assert.deepEqual(events, ['conversion_start:user', 'copy_failure:user']);
  tracker.copy(tracker.snapshot(true), true);
  assert.equal(events.filter(e => e === 'effective_use:user').length, 1);
});
test('duplicate settles and repeated copies count once per input revision', () => {
  const { tracker, events } = setup();
  tracker.change('user');
  const snapshot = tracker.snapshot(true);
  tracker.settle(snapshot); tracker.settle(snapshot);
  tracker.copy(snapshot, true); tracker.copy(snapshot, true);
  assert.deepEqual(events, ['conversion_start:user', 'conversion_success:user', 'copy_success:user', 'effective_use:user']);
});
test('stale clipboard and debounce responses cannot qualify a newer revision', () => {
  const { tracker, events } = setup();
  tracker.change('user');
  const previous = tracker.snapshot(true);
  tracker.change('user');
  tracker.settle(previous); tracker.copy(previous, true);
  assert.deepEqual(events, ['conversion_start:user']);
});
test('changing back to an example clears user origin; a later edit starts a new task', () => {
  const { tracker, events } = setup();
  tracker.change('user'); tracker.copy(tracker.snapshot(true), true);
  tracker.change('example'); tracker.copy(tracker.snapshot(true), true);
  tracker.change('user'); tracker.copy(tracker.snapshot(true), true);
  assert.equal(events.filter(e => e === 'effective_use:user').length, 2);
  assert.equal(events.filter(e => e === 'conversion_start:user').length, 1);
});

const analyticsScript = readFileSync(new URL('../public/analytics.js', import.meta.url), 'utf8');
function analyticsContext(hostname: string, search = '', stored = '') {
  let value = stored;
  const scripts: unknown[] = [];
  const window = { location: { hostname, search } };
  const context = { window, URLSearchParams, sessionStorage: {
    getItem: () => value || null,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: () => { value = ''; },
  }, document: { createElement: () => ({}), head: { appendChild: (script: unknown) => scripts.push(script) } } };
  vm.runInNewContext(analyticsScript, context);
  return { scripts, window, value };
}
test('analytics never loads for local or preview origins, or an internal production session', () => {
  for (const host of ['127.0.0.1', 'localhost', 'preview.workers.dev']) assert.equal(analyticsContext(host).scripts.length, 0);
  assert.equal(analyticsContext('uniport.janine-cheng22.workers.dev', '?unitport_internal=1').scripts.length, 0);
  assert.equal(analyticsContext('uniport.janine-cheng22.workers.dev', '', '1').scripts.length, 0);
});
test('production loads exactly one tag; explicit opt-in can end the internal session', () => {
  assert.equal(analyticsContext('uniport.janine-cheng22.workers.dev').scripts.length, 1);
  const restored = analyticsContext('uniport.janine-cheng22.workers.dev', '?unitport_internal=0', '1');
  assert.equal(restored.scripts.length, 1);
  assert.equal(restored.value, '');
});
