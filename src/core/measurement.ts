// Product data never enters this interface. Revisions exist only in memory.
export type InputOrigin = 'initial' | 'example' | 'user';
export type UsageEvent = 'conversion_start' | 'conversion_success' | 'copy_success' | 'copy_failure' | 'effective_use' | 'example_use' | 'extension_store_click';
export type UsageSnapshot = { revision: number; origin: InputOrigin; valid: boolean };
export type UsageSink = (event: UsageEvent, origin: InputOrigin) => void;

export class UsageTracker {
  revision = 0;
  origin: InputOrigin = 'initial';
  private started = false;
  private converted = -1;
  private copied = -1;
  private emit: UsageSink;
  constructor(emit: UsageSink) { this.emit = emit; }

  adjust() { this.revision += 1; }

  change(origin: 'example' | 'user') {
    this.revision += 1;
    this.origin = origin;
    if (origin === 'example') this.emit('example_use', origin);
    if (origin === 'user' && !this.started) {
      this.started = true;
      this.emit('conversion_start', origin);
    }
  }
  snapshot(valid: boolean): UsageSnapshot {
    return { revision: this.revision, origin: this.origin, valid };
  }
  settle(snapshot: UsageSnapshot) {
    if (!snapshot.valid || snapshot.origin !== 'user' || snapshot.revision !== this.revision || this.converted === snapshot.revision) return;
    this.converted = snapshot.revision;
    this.emit('conversion_success', snapshot.origin);
  }
  copy(snapshot: UsageSnapshot, success: boolean) {
    // A late clipboard response must not qualify a newer input revision.
    if (!snapshot.valid || snapshot.revision !== this.revision) return;
    if (!success) { this.emit('copy_failure', snapshot.origin); return; }
    if (this.copied === snapshot.revision) return;
    this.copied = snapshot.revision;
    this.emit('copy_success', snapshot.origin);
    if (snapshot.origin === 'user') {
      this.settle(snapshot);
      this.emit('effective_use', snapshot.origin);
    }
  }
}
