const entries = new Map();
const MAX_ENTRIES = 2000;

// Coalesce simultaneous reads; failed requests are never cached.
export function cachedCRMQuery(key, ttl, read) {
   const now = Date.now();
   const entry = entries.get(key);
   if (entry && (entry.pending || entry.expiresAt > now)) return entry.promise;
   if (entries.size >= MAX_ENTRIES) {
      for (const [oldKey, old] of entries) {
         if (!old.pending && (old.expiresAt <= now || entries.size >= MAX_ENTRIES)) entries.delete(oldKey);
         if (entries.size < MAX_ENTRIES) break;
      }
   }
   const next = { pending: true, expiresAt: 0 };
   next.promise = Promise.resolve().then(read).then(value => {
      next.pending = false;
      next.expiresAt = Date.now() + ttl;
      return value;
   }, error => {
      if (entries.get(key) === next) entries.delete(key);
      throw error;
   });
   entries.set(key, next);
   return next.promise;
}
