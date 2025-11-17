# Optimization Plan: Conditional Promise Allocation

## Goal

Eliminate unnecessary promise allocation and microtick overhead in `metric.get()` and `metric.getForPromString()` when the `collect` function is not present or is not async.

## Problem

Currently, both methods are always declared as `async`, which means:

1. They always return a Promise, even when no async work is needed
2. This adds a microtick to the event loop
3. Unnecessary overhead when `collect` is not defined or is synchronous

## Current Implementation Pattern

```javascript
async getForPromString() {
  if (this.collect) {
    const v = this.collect();
    if (v instanceof Promise) await v;
  }
  // ... synchronous work ...
  return result;
}

async get() {
  const data = await this.getForPromString();
  // ... more synchronous work ...
  return data;
}
```

## Proposed Solution: Option A with Code Reuse (APPROVED)

### Implementation Approach

In the metric constructor, assign different implementations based on whether `collect` is provided. The async version will call the sync version to maximize code reuse:

```javascript
// Sync implementation (always present)
getForPromStringSync() {
  // ... all the synchronous logic ...
  return result;
}

// Async wrapper (only assigned when collect exists)
async getForPromStringAsync() {
  const v = this.collect();
  if (v instanceof Promise) await v;
  return this.getForPromStringSync();
}

constructor(config) {
  // ... existing setup ...

  if (config.collect) {
    this.getForPromString = this.getForPromStringAsync;
    this.get = this.getAsync;
  } else {
    this.getForPromString = this.getForPromStringSync;
    this.get = this.getSync;
  }
}
```

**Pros:**

- Zero overhead when `collect` is not present
- Clean implementation with maximum code reuse
- No runtime checks in hot path
- Async version simply wraps sync version

**Cons:**

- Slightly more complex constructor
- Extra function call in async path (negligible overhead)

### Option B: Conditional Async Wrapper

Create sync versions and wrap them conditionally:

```javascript
getForPromStringSync() {
  // ... all the sync logic ...
  return result;
}

getForPromString() {
  if (this.collect) {
    return this.getForPromStringAsync();
  }
  return this.getForPromStringSync();
}

async getForPromStringAsync() {
  const v = this.collect();
  if (v instanceof Promise) await v;
  return this.getForPromStringSync();
}
```

**Pros:**

- Shared sync logic
- Still optimized for no-collect case

**Cons:**

- Extra function call overhead
- More complex

### Option C: Check at Call Site

Keep async methods but return early without await:

```javascript
getForPromString() {
  if (this.collect) {
    return this.getForPromStringAsync();
  }
  // ... synchronous implementation ...
  return result; // Returns plain value, not Promise
}

async getForPromStringAsync() {
  const v = this.collect();
  if (v instanceof Promise) await v;
  // ... synchronous implementation ...
  return result;
}
```

**Pros:**

- Can still return non-Promise when no collect
- Minimal duplication

**Cons:**

- Callers need to handle both Promise and non-Promise returns

## Implementation Steps

### Phase 1: Histogram

1. Read `lib/histogram.js` and understand current implementation
2. Implement chosen solution (recommend Option A)
3. Update constructor to assign methods conditionally
4. Create sync and async versions of:
   - `getForPromString()`
   - `get()`
5. Test with and without `collect` function
6. Benchmark performance difference

### Phase 2: Summary

1. Read `lib/summary.js`
2. Apply same pattern as histogram
3. Test and benchmark

### Phase 3: Counter

1. Read `lib/counter.js`
2. Apply same pattern
3. Test and benchmark

### Phase 4: Gauge

1. Read `lib/gauge.js`
2. Apply same pattern
3. Test and benchmark

### Phase 5: Registry

1. Check if `registry.metrics()` and `registry.getMetricsAsJSON()` need updates
2. These methods call `metric.get()` - should still work with both Promise and non-Promise
3. If needed, handle both return types

## Testing Strategy

1. **Unit Tests**: Verify both sync and async paths work correctly
2. **Integration Tests**: Ensure registry still works with both metric types
3. **Benchmark**: Measure performance improvement with serialization benchmark
4. **Regression**: Ensure all existing tests still pass

## Expected Performance Impact

Conservative estimate:

- Metrics without `collect`: ~5-10% improvement (eliminated microtick overhead)
- Metrics with async `collect`: No change
- Overall serialization: Depends on % of metrics with collect functions

## Risks and Mitigations

**Risk 1**: Breaking change if external code depends on Promise return type
**Mitigation**: This is an internal optimization; public API remains compatible

**Risk 2**: Code duplication between sync/async versions
**Mitigation**: Share as much logic as possible; accept minimal duplication for performance

**Risk 3**: Constructor complexity
**Mitigation**: Document clearly; method assignment is a common pattern

## Decision: APPROVED ✓

Implementation approach selected:

- [x] **Option A: Dynamic Method Assignment with Code Reuse**
  - Async version calls sync version to eliminate duplication
  - Zero overhead for metrics without `collect` function
  - Clean separation of sync/async paths

## Next Steps

1. ~~Get user approval on approach~~ ✓ APPROVED
2. Start with Phase 1 (Histogram) - implement sync/async split
3. Measure and validate improvement with benchmark
4. Proceed to other metric types if successful (Summary, Counter, Gauge)
