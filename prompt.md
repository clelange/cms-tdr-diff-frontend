# Vue 3 Migration Continuation Prompt

Use this prompt to continue the Vue 2 to Vue 3 migration if work is interrupted.

---

## Context

You are helping migrate a Vue 2 / Nuxt 2 frontend application to Vue 3 / Nuxt 3.

**Project Location:** `/home/clange/cms-tdr-diff-dev/cms-tdr-diff-frontend`
**Git Branch:** `feature/vue3-migration`
**Plan Document:** `plan.md` in the project root

## Current State

Check the current migration progress by:
1. Reading `plan.md` to see completed tasks (marked with [x])
2. Running `git log --oneline -10` to see recent commits
3. Running `docker-compose up` to test current state

## Key Decisions Made

- **UI Library:** Oruga UI with Bulma theme (replacing Buefy)
- **State Management:** Pinia with persisted state plugin (replacing Vuex)
- **API Client:** Built-in $fetch (replacing @nuxtjs/axios)
- **Migration Strategy:** Incremental, component-by-component
- **Backend:** Minor changes OK if needed, but primarily frontend-only migration

## Project Structure Overview

### Current (Nuxt 2)
```
cms-tdr-diff-frontend/
├── nuxt.config.js          # Nuxt 2 config
├── package.json            # Vue 2 dependencies
├── layouts/default.vue     # Uses <nuxt /> slot
├── pages/
│   ├── index.vue           # Home page
│   ├── About.vue           # About page
│   ├── StatusBoard.vue     # Job status tracking
│   └── _.vue               # Catch-all dynamic route
├── components/
│   ├── Header.vue          # Navbar with Buefy
│   ├── Footer.vue          # Footer with version info
│   ├── ListNotes.vue       # Project listing table
│   ├── ListCommits.vue     # Commit listing with selection
│   ├── CmsLogo.vue         # SVG logo
│   └── Logo.vue            # Vue/Nuxt logo
├── store/                  # Vuex stores
│   ├── index.js            # Main store (tdrTypes, apiStatus)
│   ├── projects.js         # Project listing
│   ├── commits.js          # Commit history
│   ├── jobs.js             # Pipeline status
│   └── preferences.js      # User preferences
├── plugins/
│   ├── projects.server.js  # Server-side init
│   └── htmlDecode.js       # HTML decode utility
└── Dockerfile              # Node 13 based
```

### Target (Nuxt 3)
```
cms-tdr-diff-frontend/
├── nuxt.config.ts          # Nuxt 3 config
├── app.vue                 # App entry point
├── package.json            # Vue 3 dependencies
├── layouts/default.vue     # Uses <slot />
├── pages/
│   ├── index.vue
│   ├── about.vue           # Lowercase
│   ├── statusboard.vue     # Lowercase
│   └── [...slug].vue       # New catch-all syntax
├── components/             # Oruga components
├── stores/                 # Pinia stores
│   ├── main.ts
│   ├── projects.ts
│   ├── commits.ts
│   ├── jobs.ts
│   └── preferences.ts
├── composables/
│   └── useApi.ts
├── plugins/
│   └── oruga.ts
├── Dockerfile              # Node 20 based
├── Dockerfile.dev
└── docker-compose.yml
```

## Docker Commands

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Run commands in container
docker-compose exec frontend sh

# Rebuild after dependency changes
docker-compose build --no-cache frontend

# Build production image
docker build -t cms-tdr-diff-frontend:vue3 .

# Run production container
docker run -p 3000:3000 -e BACKEND_URL=http://backend:8000 cms-tdr-diff-frontend:vue3
```

## Resume Instructions

1. **Read the plan:** Check `plan.md` for the current phase and uncompleted tasks
2. **Check git status:** `git status` and `git log --oneline -5`
3. **Test current state:** Start Docker and verify what's working
4. **Continue from last task:** Pick up the next uncompleted item in the plan

## Prompt to Continue

Copy and paste this to resume:

---

I'm continuing the Vue 2 to Vue 3 migration for the CMS TDR Diff frontend.

Please:
1. Read `plan.md` to understand the current progress
2. Check git history to see what's been completed
3. Identify the next uncompleted task
4. Continue the migration from that point
5. Update `plan.md` as tasks are completed

The project is in `/home/clange/cms-tdr-diff-dev/cms-tdr-diff-frontend` on branch `feature/vue3-migration`.

All development and testing should be done in Docker containers.

---

## Quick Reference

### Buefy to Oruga Component Mapping

| Buefy | Oruga |
|-------|-------|
| b-button | o-button |
| b-table | o-table |
| b-table-column | o-table-column |
| b-input | o-input |
| b-field | o-field |
| b-navbar | o-navbar |
| b-navbar-item | o-navbar-item |
| b-icon | o-icon |
| b-loading | o-loading |
| b-switch | o-switch |
| b-select | o-select |
| b-tabs | o-tabs |
| b-tab-item | o-tab-item |

### Slot Syntax Migration

```vue
<!-- Vue 2 (Old) -->
<template slot="header">...</template>
<template slot-scope="props">...</template>
<template slot="brand">...</template>

<!-- Vue 3 (New) -->
<template #header>...</template>
<template #default="props">...</template>
<template #brand>...</template>
```

### Store Access Migration

```javascript
// Vue 2 / Vuex
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['tdrTypes', 'apiStatus'])
  },
  methods: {
    loadData() {
      this.$store.dispatch('loadTdr')
    }
  }
}

// Vue 3 / Pinia
import { storeToRefs } from 'pinia'
import { useMainStore } from '~/stores/main'

const store = useMainStore()
const { tdrTypes, apiStatus } = storeToRefs(store)

function loadData() {
  store.loadTdr()
}
```

### API Calls Migration

```javascript
// Vue 2 / Axios
await this.$axios.$get('/types')
await this.$axios.$post('/trigger', data)

// Vue 3 / $fetch
await $fetch('/api/types')
await $fetch('/api/trigger', { method: 'POST', body: data })
```

### Route Access Migration

```javascript
// Vue 2
this.$route.params.pathMatch

// Vue 3
const route = useRoute()
route.params.slug  // For [...slug].vue
```

### Runtime Config Migration

```javascript
// Vue 2 (nuxt-env)
this.$env.BUILD_HASH

// Vue 3 (useRuntimeConfig)
const config = useRuntimeConfig()
config.public.buildHash
```

## Backend API Endpoints

The Go backend provides these endpoints (no changes needed):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/types` | GET | List of TDR types (papers, notes, etc.) |
| `/projects/{group}` | GET | Projects in a group |
| `/commits/{group}/{project}` | GET | Commits for a project |
| `/trigger` | POST | Trigger diff pipeline |
| `/status/pipeline/{id}` | GET | Pipeline job status |
| `/version` | GET | Backend version info |

## Known Issues in Original Code

1. **StatusBoard.vue** has duplicate `</template>` and `<script>` blocks (line 96-98) - needs fixing during migration
2. **ListNotes.vue** regex filter could fail on incomplete escape sequences
3. Some components don't handle API errors gracefully

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| BACKEND_URL | Backend API URL | http://localhost:8000 |
| BUILD_HASH | Frontend build identifier | local |
| API_TOKEN | Backend API token | (none) |
