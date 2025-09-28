# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **prom-client**, a Prometheus client library for Node.js that provides metrics collection and exposure functionality. It supports all standard Prometheus metric types: counters, gauges, histograms, and summaries.

## Development Commands

### Essential Commands

- `npm test` - Full test suite (lint + prettier + typescript + unit tests with coverage)
- `npm run test-unit` - Run Jest unit tests only
- `npm run lint` - ESLint validation
- `npm run check-prettier` - Prettier formatting check
- `npm run compile-typescript` - TypeScript compilation check

### Running Single Tests

Tests are located in `/test/` and follow the pattern `*Test.js`. Use Jest's pattern matching:

```bash
npm run test-unit -- --testNamePattern="Counter"
npm run test-unit -- test/counterTest.js
```

## Code Architecture

### Core Structure

The library is organized around four main metric types in `/lib/`:

- **counter.js** - Cumulative metrics that only increase
- **gauge.js** - Metrics that can go up and down
- **histogram.js** - Samples observations in configurable buckets
- **summary.js** - Calculates percentiles of observed values

### Key Components

- **registry.js** - Central registry for all metrics, supports Prometheus and OpenMetrics formats
- **defaultMetrics.js** - Orchestrates collection of Node.js system metrics (CPU, memory, GC, etc.)
- **cluster.js** - Aggregator registry for Node.js cluster support
- **pushgateway.js** - Push metrics to Prometheus Pushgateway

### Entry Points

- **index.js** - Main entry point exporting all public APIs
- **index.d.ts** - Comprehensive TypeScript definitions

### Default Metrics (/lib/metrics/)

System metrics are modular and platform-aware:

- Some metrics (like file descriptors) are Linux-only
- Event loop lag, garbage collection, heap usage for Node.js internals
- Process information and resource usage

## Development Patterns

### Metric Creation Pattern

Each metric type follows a consistent pattern:

1. Extends base `Metric` class
2. Implements `collect()` method returning metric samples
3. Supports labels for dimensional metrics
4. Registry handles serialization to Prometheus format

### Testing Approach

- Unit tests in `/test/` with Jest
- Metrics tests in `/test/metrics/` for default metrics
- Examples in `/example/` demonstrate real usage patterns
- Mock HTTP requests with `nock` library

### TypeScript Support

- Full type definitions maintained alongside JS code
- `noEmit: true` - types only, no compilation to JS
- Strict mode enabled for type safety
