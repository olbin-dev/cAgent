# cAgent

**A robust JSON-RPC integration layer for autonomous AI-to-AI orchestration in OpenClaw.**

This repository contains the patch and implementation for **cAgent**, bridging **AgentKit 2.0** with the **OpenClaw** daemon, completely bypassing the legacy CLI argument parsing that frequently causes `400 INVALID_ARGUMENT` errors during AI-driven local terminal interactions.

In addition, it provides a critical patch for a known bug in OpenClaw's `Gateway` system where `Error` objects fail JSON serialization during plugin state saves, which traditionally causes the OpenClaw Gateway to crash or fail to launch as a background LaunchAgent.

## 🚀 Features

- **AgentKit 2.0 Core Interface**: Replaces the CLI `process.argv` approach with a native, structured JSON-RPC API endpoint for direct payload injection.
- **AgentKitToolAdapter**: Auto-sanitizes and encodes multi-line or complex JSON payloads sent by orchestrating agents (like Jules or Claude), guaranteeing strict type safety.
- **Gateway Crash Fix (`plugin-state-store` patch)**: A direct patch to OpenClaw's internal SQLite state manager to gracefully handle non-serializable objects (like `Error` instances) emitted by failing plugins (e.g., `spotify-player` or `voice-call`), ensuring the daemon remains stable 24/7.
- **Daemonization Bypass**: Guidelines for ensuring `launchd` security constraints on macOS do not silently block WebSocket (`ws://127.0.0.1:18789`) orchestration channels.

## ⚙️ Installation / Applying the Patch

To inject this bridge into your local OpenClaw source repository:

1. Copy the `src/` directory to your OpenClaw source directory.
2. Update `src/index.ts` in OpenClaw to import and initialize the `AgentKitClient`.
3. Apply the JSON-Serialization patch to `src/plugin-state/plugin-state-store.ts` (detailed below).

### The Gateway Crash Fix
In `openclaw_source/src/plugin-state/plugin-state-store.ts`, locate `assertPlainJsonValue` and modify:

```typescript
// FIX 1: Allow undefined to prevent silent dropping crashes
  if (valueType !== "object") {
    if (valueType === "undefined") return; 
    throw invalidInput(`plugin state value at ${path} must be JSON-serializable`);
  }

// FIX 2: Gracefully ignore Error objects from broken plugins
    if (Object.getPrototypeOf(objectValue) !== Object.prototype) {
      return; // Prevent gateway crash on Error serialization
    }
```

## 🌐 Usage (Autonomous Operation)

Once built (`pnpm build`), you can run the gateway in background persistence mode:

```bash
# Recommended: Run via node directly to bypass macOS LaunchAgent SIP restrictions
node scripts/run-node.mjs gateway --port 18789
```

With the Gateway active, external AI agents can dispatch instructions to OpenClaw using standard HTTP REST or WebSocket requests conforming to the AgentKit 2.0 schema, enabling fully autonomous **Office 2.0** or **Prometheus-OS** local orchestration topologies.

---
*Maintained by the SS-FIA Engineering Team.*
