# Win-back tools — Admin app data extension

An [admin app data extension](https://shopify.dev/docs/apps/build/sidekick/build-app-data)
(`admin.app.tools.data`). It exposes this app's data to Sidekick as tools.

In this workshop you evolve it in three moves:

1. **Build 1 · Step 1 — expose a capability, hit the ceiling.** Register
   `find_lapsed_customers` (calls `/api/customers/lapsed`) and return a plain
   answer. Sidekick can answer the lookup — but can't act on it.
   → `prompts/01-expose-data-extension.md`
2. **Build 1 · Step 2 — make it legible.** Write a real `extensions_summary`, tighten the
   tool/extension `description`, and shape `instructions.md` so Sidekick knows
   when to use it. → `prompts/02-make-capability-legible.md`
3. **Build 1 · Step 3 — shape the payload.** Return a `resource_link` with a stable
   `uri`, a `mimeType` that matches the action intent's `type`, and `_meta` the
   model reasons over — within the 4,000-token / 1s budget.
   → `prompts/03-shape-payload-for-composition.md`

### Key files

- `src/index.js` — registers tools via `shopify.tools.register()`
- `tools.json` — JSON-Schema declarations for each tool
- `instructions.md` — when/how Sidekick should use the tools
- `shopify.extension.toml` — target + `description`

### Testing

Run `shopify app dev --use-localhost`, and open the `admin.app.tools.data` preview
link. Tools run client-side — logs appear in the browser dev console.
