/* R1B.2 — Production Workspace V2 · read-only Storage guard.

   The real adapter is a strictly read-only projection over browser storage
   (r1b2 acceptance §11: no writes, no schema changes). Some of the existing
   production read helpers it reuses have a documented read-time write side
   effect — most notably `readReportHistory`, which prunes and REWRITES the
   history key when it drops malformed or overflow entries, and
   `readHumanDecisionLedger`, which can normalise its own store. R1B.2 must
   surface those exact validated reads (it must not fork or duplicate their
   parsing) yet must never persist anything.

   This guard resolves the tension structurally: it delegates every read to the
   real Storage and turns every mutation (`setItem`, `removeItem`, `clear`) into
   a silent no-op. Wrapping the injected Storage once at the adapter boundary
   makes it impossible for the adapter — or anything it calls — to write, while
   the underlying read logic is reused unchanged. */

export function readOnlyStorage(storage: Storage): Storage {
  const guard: Storage = {
    get length(): number {
      return storage.length;
    },
    clear(): void {
      /* no-op — read-only projection never mutates storage. */
    },
    getItem(key: string): string | null {
      return storage.getItem(key);
    },
    key(index: number): string | null {
      return storage.key(index);
    },
    removeItem(_key: string): void {
      /* no-op — read helpers that prune on read must not persist here. */
      void _key;
    },
    setItem(_key: string, _value: string): void {
      /* no-op — the milestone records no state. */
      void _key;
      void _value;
    },
  };
  return guard;
}
