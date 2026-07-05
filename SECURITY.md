# 🔒 Security Report — What's ON MeOW

This document summarises the security posture of the project: how it handles
data, the secure-coding practices applied, and an honest assessment of the
dependency audit.

_Last reviewed: during the hackathon submission period._

---

## 1. Data handling

**What's ON MeOW is a fully client-side application.** There is no backend, no
database, and no network transmission of user or pet data.

| Data | Where it lives | Notes |
|------|----------------|-------|
| Collar readings (HR, temp, activity, GPS) | In-memory (simulated) | Sourced from `mock_data.json`; never sent anywhere. |
| Geofence event log | `localStorage` (`meow-geofence-events`) | Stays on the device. |
| Cat profile | In-memory | Demo data only; no real personal data. |

Because nothing is transmitted off-device, the network attack surface for user
data is effectively zero in this build.

### Responsible handling of persisted data
- The geofence event log is the only thing written to `localStorage`.
- On read, the stored value is **treated as untrusted**: parsing is wrapped in
  `try/catch`, the result is validated to be an array, and each entry is
  shape-checked (`id`, `type ∈ {enter, exit}`, numeric `distance`, string
  `timestamp`) before use. Malformed data is discarded rather than trusted.
- Writes are wrapped in `try/catch` so private mode / quota limits degrade
  gracefully instead of crashing the app.

---

## 2. Secure coding practices

- **No secrets in the repo.** No API keys, tokens, passwords, or credentials
  are present. Nothing needs a `.env` to run.
- **TypeScript strictness.** The domain layer is fully typed, reducing a class
  of runtime errors.
- **Pure, deterministic domain logic.** The health and geofence engines have no
  side effects, which removes injection/IO risk from the core logic and makes
  behaviour predictable and testable.
- **Property-based tests** assert safety-relevant invariants (e.g. wellness
  score always bounded, critical fever always flagged) across thousands of
  generated inputs — see `src/data/*.test.ts`.
- **No `dangerouslySetInnerHTML`, no `eval`, no dynamic code execution.** All
  rendering goes through React's escaped JSX, mitigating XSS.
- **No untrusted external network calls.** The app does not fetch from
  third-party endpoints, so there is no data-exfiltration or SSRF path.

---

## 3. Dependency audit (`npm audit`)

We take dependency hygiene seriously and document findings transparently.

### Fixed
- **esbuild (moderate, GHSA-67mh-4wv8-2f99).** Resolved by pinning the
  transitive dependency to a patched release via an `overrides` entry:
  ```json
  "overrides": { "esbuild": "^0.25.0" }
  ```
  This clears the advisory without a breaking toolchain upgrade.

### Accepted (with justification) — dev-only, no production impact
The remaining advisories are all in **Vite's development server**
(`vite <= 6.4.2`), reached transitively through `vitest`:

| Advisory | Scope |
|----------|-------|
| Path traversal in optimized-deps `.map` handling (GHSA-4w7w-66w2-5vf9) | `vite dev` server |
| `launch-editor` NTLMv2 hash disclosure via UNC path (Windows) (GHSA-v6wh-96g9-6wx3) | `vite dev` server |
| `server.fs.deny` bypass on Windows alternate paths (GHSA-fx2h-pf6j-xcff) | `vite dev` server |

**Risk assessment:**
- These affect only the **local development server**, not the production build
  output shipped to users (`npm run build` produces static assets that do not
  include the dev server).
- Exploitation requires an attacker to reach a developer's dev server on the
  local network — not a concern for the built, deployed artifact.
- The official remediation is a **major, breaking upgrade to `vite@8`**, which
  conflicts with the current `vitest` / `@vitejs/plugin-react` peer ranges and
  would destabilise the build toolchain close to submission.

**Mitigations while developing:**
- Bind the dev server to `localhost` only (Vite's default); do **not** use
  `--host` on untrusted networks.
- Avoid opening untrusted sites in the same browser session while the dev
  server is running.

_Upgrade path for the future:_ move `vite`, `vitest`, and
`@vitejs/plugin-react` to their latest majors together (they must be upgraded as
a set), then re-run the test suite.

---

## 4. Aikido security scan (bonus)

An [Aikido](https://www.aikido.dev/) scan is recommended for an independent,
automated review. To run and attach a report:

```bash
# via the Aikido GitHub/CLI integration, point it at this repository
# then export the report to:
#   docs/aikido-scan-report.pdf   (or .json)
```

Once generated, drop the report file in this repo and link it here. Given the
findings above, we expect the scan to confirm: no secrets, no production runtime
vulnerabilities, and only the dev-tooling advisories already documented in
section 3.

---

## 5. Reporting

This is a hackathon project. For any security question about the code, please
contact the project author through the submission channel.
