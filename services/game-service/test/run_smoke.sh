#!/usr/bin/env bash
# Run the Node smoke test; defaults to localhost:3005
set -euo pipefail
node test/smoke.js
