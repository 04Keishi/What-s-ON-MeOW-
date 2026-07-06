# 🛡️ Aikido Security Scan Report

Independent, automated security review of **What's ON MeOW** using
[Aikido Security](https://www.aikido.dev/), connected to the GitHub repository.

- **Repository:** `04Keishi/What-s-ON-MeOW-`
- **Scan type:** SAST (code) + SCA (dependencies) + secrets + cloud/SCM posture
- **Scanned branch:** `main`
- **Result screenshot:** [`aikido-scan-report.png`](./aikido-scan-report.png)

> _Update the scan date after re-running so it reflects the latest submission._

---

## Summary of findings

| Severity | Count | Notes |
|----------|:-----:|-------|
| 🔴 Critical | **0** | — |
| 🟠 High | **0** | — |
| 🟡 Medium | **1** | Account/organisation posture, **not** an application code issue. |
| 🟢 Low | **0** | — |

**Code & dependency issues: 0.** No vulnerabilities were found in the
application source code, and no exploitable vulnerabilities in the dependency
tree. No secrets/credentials were detected in the repository.

### The one open finding

| Finding | Severity | Type | Scope |
|---------|----------|------|-------|
| "GitHub organization should enforce an IP allow list" | Medium | SCM / account posture | GitHub org `04Keishi` |

**Assessment.** This is a *hardening recommendation for the GitHub account*, not
a defect in the What's ON MeOW codebase. It suggests restricting access to the
GitHub organisation by IP allow-list. It does not affect the security of the
application itself, its users, or its build output. For a personal hackathon
account, enforcing an org-wide IP allow list is out of scope and can be left
as an accepted, documented item.

---

## What this confirms

The scan is consistent with the manual review in [`../SECURITY.md`](../SECURITY.md):

- No hardcoded secrets, API keys, or credentials.
- No production runtime vulnerabilities in application code.
- No dangerous sinks (`eval`, `dangerouslySetInnerHTML`) and no third-party
  data exfiltration paths.
- The only dependency advisories are dev-server-only (Vite/esbuild tooling),
  already assessed and mitigated in `SECURITY.md`.

---

## How to reproduce

1. Sign in at [app.aikido.dev](https://app.aikido.dev) with GitHub.
2. Add the GitHub integration and select the `What-s-ON-MeOW-` repository.
3. Aikido runs SAST + SCA + secret scanning automatically on `main`.
4. Review findings under **Issues**; capture the summary (screenshot / CSV export).
