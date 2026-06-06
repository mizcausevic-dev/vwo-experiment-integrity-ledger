# vwo-experiment-integrity-ledger

Board-readable VWO experiment integrity ledger for sample health, statistical confidence, guardrail health, revenue attribution, QA coverage, conflicting metrics, and rollout risk.

[![ci](https://github.com/mizcausevic-dev/vwo-experiment-integrity-ledger/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/vwo-experiment-integrity-ledger/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/vwo-experiment-integrity-ledger/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/vwo-experiment-integrity-ledger/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Experiment wins can become expensive when teams ship a statistically noisy result across high-value surfaces:

- Is sample quality good enough?
- Are guardrail metrics still healthy?
- Is revenue attribution clear?
- Did QA cover the variants and target audiences?
- Is rollout blast radius explicit?

This repo converts synthetic VWO experiment metadata into a rollout-integrity ledger for growth and executive teams.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx vwo-experiment-integrity-ledger fixtures/vwo-experiment-sample.json --format markdown
npx vwo-experiment-integrity-ledger fixtures/vwo-experiment-sample.json --format json
```

## Kinetic Gain fit

This adds an experimentation governance lane to the Kinetic Gain portfolio: conversion tests, rollout risk, revenue-system trust, guardrail metrics, and executive-safe growth decisions.
