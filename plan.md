# Vue 2 to Vue 3/Nuxt 3 Migration Plan

## Project Overview

**Application:** CMS TDR Diff Frontend  
**Current Stack:** Nuxt 2.15.8 (Vue 2), Buefy, Vuex, Node 13  
**Target Stack:** Nuxt 3.x (Vue 3), Oruga UI, Pinia, Node 20 LTS  
**Migration Strategy:** Incremental migration with Docker-based development and testing

---

## Phase 1: Environment Setup and Git Branch

### 1.1 Git Repository Initialization
- [x] Git repository already exists in cms-tdr-diff-frontend
- [x] Create feature branch: `feature/vue3-migration`
- [x] Commit current state as baseline

### 1.2 Docker Development Environment
- [x] Create `docker-compose.yml` for development
  - Frontend service (Nuxt 3)
  - Backend service (existing Go API)
  - Shared network
- [x] Create `Dockerfile.dev` for hot-reload development
- [x] Create `Dockerfile.prod` for production builds
- [ ] Verify backend connectivity from Docker container

### 1.3 Create New Nuxt 3 Project Structure
- [x] Scaffold new Nuxt 3 project alongside existing code
- [x] Configure TypeScript (optional but recommended)
- [x] Set up ESLint + Prettier with existing rules
- [x] Configure Vite build tool settings

---

## Phase 2: Core Configuration Migration

### 2.1 Nuxt Configuration (`nuxt.config.ts`)
- [x] Migrate `nuxt.config.js` to `nuxt.config.ts`
- [x] Configure runtime config (replaces `nuxt-env`)
  ```typescript
  runtimeConfig: {
    public: {
      buildHash: process.env.BUILD_HASH || 'local'
    }
  }
  ```
- [x] Set up API proxy with Nitro server
  ```typescript
  nitro: {
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
        prependPath: true,
      }
    }
  }
  ```
- [x] Configure head/meta tags
- [x] Set up loading indicator

### 2.2 Install and Configure Dependencies
- [x] Install Oruga UI with Bulma theme
  ```bash
  npm install @oruga-ui/oruga-next @oruga-ui/theme-bulma
  ```
- [x] Install Pinia for state management
- [x] Install date-fns (direct, no Nuxt module needed)
- [x] Install `@pinia-plugin-persistedstate/nuxt` (replaces vuex-localstorage)

---

## Phase 3: State Management Migration (Vuex to Pinia)

### 3.1 Main Store (`store/index.js` -> `stores/main.ts`)
- [x] Create Pinia store with same state structure
- [x] Migrate `tdrTypes`, `apiStatus`, `backendVersion` state
- [x] Convert mutations to actions (Pinia pattern)
- [x] Migrate `loadTdr()` and `getBackendVersion()` actions

### 3.2 Projects Store (`store/projects.js` -> `stores/projects.ts`)
- [x] Migrate `myProjects` state
- [x] Convert `load()` action with `useFetch`
- [x] Remove `{ root: true }` patterns (not needed in Pinia)

### 3.3 Commits Store (`store/commits.js` -> `stores/commits.ts`)
- [x] Migrate `commitList`, `projectInfo` state
- [x] Convert `load()` action

### 3.4 Jobs Store (`store/jobs.js` -> `stores/jobs.ts`)
- [x] Migrate `pipelineStatus` state
- [x] Convert `load()` and `update()` actions
- [x] Implement with `$fetch` (Nuxt 3 built-in)

### 3.5 Preferences Store (`store/preferences.js` -> `stores/preferences.ts`)
- [x] Migrate `search_query` state
- [x] Configure persistence with `pinia-plugin-persistedstate`

---

## Phase 4: Component Migration

### 4.1 Layout Migration (`layouts/default.vue`)
- [x] Update to Vue 3 syntax
- [x] Replace `<nuxt />` with `<slot />`
- [x] Preserve global styles

### 4.2 Header Component (`components/Header.vue`)
**Buefy to Oruga mappings:**
| Buefy | Oruga |
|-------|-------|
| `<b-navbar>` | `<o-navbar>` |
| `<b-navbar-item>` | `<o-navbar-item>` |
| `<b-icon>` | `<o-icon>` |
| `slot="brand"` | `#brand` (Vue 3 slot syntax) |
| `slot="start"` | `#start` |
| `slot="end"` | `#end` |

- [x] Migrate template syntax
- [x] Update `mapState` to `storeToRefs`
- [x] Fix slot syntax (`slot="name"` -> `#name`)
- [x] Convert Options API to Composition API

### 4.3 Footer Component (`components/Footer.vue`)
- [x] Replace `this.$env.BUILD_HASH` with `useRuntimeConfig()`
- [x] Convert to Composition API

### 4.4 ListNotes Component (`components/ListNotes.vue`)
**Buefy to Oruga mappings:**
| Buefy | Oruga |
|-------|-------|
| `<b-loading>` | `<o-loading>` |
| `<b-field>` | `<o-field>` |
| `<b-input>` | `<o-input>` |
| `<b-table>` | `<o-table>` |
| `<b-table-column>` | `<o-table-column>` |
| `<b-switch>` | `<o-switch>` |
| `<b-select>` | `<o-select>` |
| `<b-tabs>` | `<o-tabs>` |
| `:active.sync` | `v-model:active` |
| `slot-scope="props"` | `#default="props"` |

- [x] Migrate all Buefy components to Oruga
- [x] Replace `this.$route` with `useRoute()`
- [x] Replace `this.$store` with Pinia store
- [x] Replace `this.$dateFns` with direct import
- [x] Convert computed properties to `computed()` function

### 4.5 ListCommits Component (`components/ListCommits.vue`)
- [x] Same Buefy to Oruga migration as ListNotes
- [x] Replace `this.$buefy.toast` with `useProgrammatic()` from Oruga
- [x] Replace `this.$axios.$post` with `$fetch`
- [x] Update table checkbox handling for Oruga

### 4.6 Logo Components (`components/CmsLogo.vue`, `components/Logo.vue`)
- [x] Minimal changes needed (mostly SVG)
- [x] Update SCSS scoped styles if needed

---

## Phase 5: Page Migration

### 5.1 Index Page (`pages/index.vue`)
- [x] Replace `<nuxt-link>` with `<NuxtLink>`
- [x] Convert `mapState` to Pinia composables
- [x] Update component imports (auto-import in Nuxt 3)

### 5.2 About Page (`pages/About.vue`)
- [x] Same pattern as index
- [x] Rename to `pages/about.vue` (lowercase convention)

### 5.3 StatusBoard Page (`pages/StatusBoard.vue`)
- [x] Fix duplicate template/script blocks (existing bug)
- [x] Migrate table and data handling
- [x] Replace `window.setInterval` with `useIntervalFn` from VueUse
- [x] Rename to `pages/statusboard.vue`

### 5.4 Catch-all Route (`pages/_.vue` -> `pages/[...slug].vue`)
- [x] Rename to Nuxt 3 catch-all syntax
- [x] Replace `fetch()` hook with `useFetch()` or `useAsyncData()`
- [x] Replace `validate()` with route middleware
- [x] Update params access (`params.pathMatch` -> `params.slug`)

---

## Phase 6: Plugin Migration

### 6.1 Server Plugin (`plugins/projects.server.js`)
- [x] Convert to Nuxt 3 plugin syntax
- [x] Use `defineNuxtPlugin`
- [x] Replace store dispatch with Pinia

### 6.2 HTML Decode Plugin (`plugins/htmlDecode.js`)
- [ ] Convert to composable or utility function
- [ ] Consider using `he` library for robustness

---

## Phase 7: API Layer Updates

### 7.1 Replace Axios with $fetch
- [x] Remove `@nuxtjs/axios` dependency
- [x] Create composable for API calls
  ```typescript
  // composables/useApi.ts
  export const useApi = () => {
    return {
        get: (url: string) => $fetch(`/api${url}`),
        post: (url: string, body: any) => $fetch(`/api${url}`, { method: 'POST', body })
    }
  }
  ```
- [x] Update all API calls in stores

### 7.2 Proxy Configuration
- [x] Configure Nitro proxy for `/api/*` routes
- [ ] Ensure API token header is passed correctly

---

## Phase 8: Docker Production Build

### 8.1 Production Dockerfile
- [x] Update to Node 20 LTS Alpine
- [x] Multi-stage build for smaller image
- [x] Configure environment variables
- [x] Test build process

### 8.2 Docker Compose Updates
- [x] Create production compose file
- [ ] Configure health checks
- [ ] Test frontend-backend communication

---

## Phase 9: Testing and Validation

### 9.1 Functional Testing (Docker)
- [ ] Test all pages render correctly
- [ ] Test API proxy works
- [ ] Test state persistence (localStorage)
- [ ] Test pipeline triggering workflow
- [ ] Test StatusBoard real-time updates

### 9.2 Visual Regression
- [ ] Compare styling with original
- [ ] Adjust Oruga/Bulma theme if needed

### 9.3 Build Verification
- [ ] `npm run build` succeeds
- [ ] Docker production build works
- [ ] All environment variables work

---

## Phase 10: Cleanup and Documentation

### 10.1 Remove Deprecated Files
- [ ] Remove old Nuxt 2 config files
- [ ] Remove unused dependencies
- [ ] Clean up package.json

### 10.2 Update Documentation
- [ ] Update README.md with new build instructions
- [ ] Document environment variables
- [ ] Update GitHub Actions workflow

---

## Dependency Mapping

| Old (Nuxt 2) | New (Nuxt 3) |
|--------------|--------------|
| nuxt@2.15.8 | nuxt@3.x |
| @nuxtjs/axios | Built-in $fetch |
| @nuxtjs/proxy | Nitro devProxy |
| @nuxtjs/date-fns | date-fns (direct) |
| buefy / nuxt-buefy | @oruga-ui/oruga-next + @oruga-ui/theme-bulma |
| nuxt-vuex-localstorage | @pinia-plugin-persistedstate/nuxt |
| nuxt-env | useRuntimeConfig() |
| vuex | pinia |
| node-sass | sass (dart-sass) |

---

## File Structure Changes

```
cms-tdr-diff-frontend/
├── nuxt.config.ts          # New config format
├── app.vue                  # New app entry
├── layouts/
│   └── default.vue          # Updated layout
├── pages/
│   ├── index.vue
│   ├── about.vue            # Renamed (lowercase)
│   ├── statusboard.vue      # Renamed (lowercase)
│   └── [...slug].vue        # Renamed catch-all
├── components/              # Same, with Oruga components
├── stores/                  # New (was store/)
│   ├── main.ts
│   ├── projects.ts
│   ├── commits.ts
│   ├── jobs.ts
│   └── preferences.ts
├── composables/             # New
│   └── useApi.ts
├── plugins/
│   └── oruga.ts            # Oruga setup
├── server/                  # New (Nitro)
│   └── api/                # Optional server routes
├── Dockerfile               # Updated
├── Dockerfile.dev           # New
└── docker-compose.yml       # New
```

---

## Risk Mitigation

1. **Oruga component parity**: Test each Buefy to Oruga conversion individually
2. **State migration**: Create automated tests for store actions
3. **Breaking changes**: Keep Nuxt 2 version in separate branch for rollback
4. **Docker networking**: Test backend connectivity early in Phase 1

---

## Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Environment Setup | 2-3 hours |
| Phase 2: Core Configuration | 1-2 hours |
| Phase 3: State Management | 2-3 hours |
| Phase 4: Component Migration | 4-6 hours |
| Phase 5: Page Migration | 2-3 hours |
| Phase 6: Plugin Migration | 1 hour |
| Phase 7: API Layer | 1-2 hours |
| Phase 8: Docker Production | 1-2 hours |
| Phase 9: Testing | 2-3 hours |
| Phase 10: Cleanup | 1 hour |
| **Total** | **17-26 hours** |
