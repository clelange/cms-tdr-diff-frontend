# CMS TDR Diff Frontend

Nuxt/Vue frontend for browsing CMS papers and notes, selecting two commits, and
triggering an OpenShift-hosted diff job through the backend API.

## Local Development

```sh
npm ci
npm run dev
```

Useful checks:

```sh
npm run typecheck
npm run build
```

## Runtime Configuration

The Nuxt server proxies browser requests from `/api/*` to the backend. Define
these values through OpenShift ConfigMaps/Secrets or local environment variables:

| Variable | Source | Purpose |
| --- | --- | --- |
| `BACKEND_URL` / `NUXT_BACKEND_URL` | ConfigMap | Internal backend URL, for example `http://tdr-diff-backend-go:8000`. |
| `API_TOKEN` / `NUXT_API_TOKEN` | Secret | Shared token accepted by the backend API middleware. |
| `BUILD_HASH` / `NUXT_PUBLIC_BUILD_HASH` | ConfigMap | Displayed build/version identifier. |
| `BUILD_DATE` / `NUXT_PUBLIC_BUILD_DATE` | ConfigMap | Displayed build timestamp, normally `$CI_COMMIT_TIMESTAMP`. |

In OpenShift, `API_TOKEN` must live in `cms-tdr-diff-api-secret`, not in the
frontend ConfigMap.

When the frontend is served behind CERN `cern-auth-proxy`, the Nuxt server
forwards the proxy identity headers (`X-Forwarded-User`,
`X-Forwarded-Email`, `X-Forwarded-Preferred-Username`, and
`X-Forwarded-Groups`) to the backend. The browser never receives the shared
backend API token.

## Deployment

GitLab CI builds the frontend image and imports it into the OpenShift
`tdr-diff-client` ImageStream. The dev deploy branch is
`feature/vue3-openshift-jobs`.

The deployment manifests and production migration checklist live in:

```text
cms-tdr-diff/cms-tdr-diff-deployment
```

Required CI variable:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `OPENSHIFT_DEV_TOKEN` | GitLab group, hidden/masked | OpenShift service account token for dev deploys. |

Production should use a separate protected variable, `OPENSHIFT_PROD_TOKEN`,
and deploy only from protected branches or tags.
