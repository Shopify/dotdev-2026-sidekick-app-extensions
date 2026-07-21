# DotDev 2026: Add a Sidekick extension to your app in 60 minutes

This repository is the starter project for the [DotDev]([url](https://dotdev.shopify.com/)) 2026 **Sidekick app
extensions** workshop.

Merchants now bring **Sidekick** a _goal_ and it composes a plan across their
apps. In this workshop you'll take an app capability that answers a single
lookup and redesign it into something Sidekick can **compose** into a merchant's
goal: *"help me win back customers who haven't ordered in 90 days."*

By the end you'll have, running against your own dev store:

- a **data extension** Sidekick can discover and invoke,
- a payload it can **act on** (a `resource_link` with a stable `uri`, a matching
  `mimeType`, and `_meta`), and
- an **action extension** that chains a data result into a merchant-confirmed
  edit: Sidekick opens a pre-filled win-back campaign; the merchant sends it.

You'll build both extensions live, step by step. Each step has a matching prompt in [`prompts/`](prompts) which contain code snippets you can copy to follow along. You can also hand the full prompt to an AI coding assistant to accelarate the same result.  A complete reference solution lives on the
[`finished`](https://github.com/Shopify/dotdev-2026-sidekick-app-extensions/tree/finished)
branch. You test everything through Sidekick on a dev store.

## Prerequisites

Before the workshop, make sure you have:

- A **Shopify development store with Sidekick** enabled, and a Partner org where
  you can create and install an app.
- **Shopify CLI 4+** installed and authenticated (`shopify version`). On an
  older major, run `npm install -g @shopify/cli@latest` (or
  `pnpm add -g @shopify/cli@latest`).
- **Node.js** (see `starter/package.json` `engines`) and a package manager
  (**npm** or **pnpm**).
- A code editor and an **AI coding assistant** with the Shopify Dev MCP server
  configured (`starter/.vscode/mcp.json` / `starter/.mcp.json`).
- The [Shopify Dev MCP server](https://shopify.dev/docs/apps/build/devmcp) connected to your AI coding assistant
- Comfort building Shopify apps. This is a 200/300-level session and assumes
  you've shipped at least one app or extension.

## Get ready

Clone this repo, then start from the app in `starter/`:

```bash
cd starter
npm install
shopify app dev --reset
shopify app dev --use-localhost
```

> [!NOTE]
> You can use `pnpm` instead of `npm`, if you prefer.

`--reset` creates a fresh app and a linked `shopify.app.<name>.toml`, so everyone
starts from a clean, consistent environment. **Before you run `dev`, delete any
existing webhook subscriptions in `shopify.app.toml`** — leftover subscriptions
are the most common cause of the tunnel failing to initialize.

Link the app to your Partner org and select your Sidekick dev store, then confirm
the embedded app loads with the seeded audience and campaigns. If the app shows
`example.com` or fails to load on first boot, please refresh the page. That's expected
CLI tunnel behavior on startup.

Shopify CLI may create local state such as `.shopify/` and
`shopify.app.<name>.toml`. These are intentionally ignored and should stay local.

## How the workshop runs

You build in **two parts**, live. Hand-code each step using the code snippets in the [`prompts/`](prompts) or use the full prompts with an AI assistant. Keep a terminal open with `shopify app dev --use-localhost` running to see your changes update live.

### Part 1 — App data: give Sidekick something to answer *and act on*

Turn `winback-tools` from a placeholder into a data extension that answers the
lookup, is legible to the agent, and returns a `resource_link` Sidekick can carry
forward.

| Step | Prompt (shortcut) | You build |
|---|---|---|
| Expose a capability, hit the ceiling | [`01`](prompts/01-expose-data-extension.md) | `find_lapsed_customers` — Sidekick answers the lookup but stalls on the goal |
| Make it legible to the agent | [`02`](prompts/02-make-capability-legible.md) | tighten `extensions_summary`, the extension `description`, and `instructions.md` so Sidekick selects it unprompted |
| Shape the payload | [`03`](prompts/03-shape-payload-for-composition.md) | `find_campaigns` returns campaign `resource_link` results (stable `uri`, matching `mimeType`, compact `_meta`) |

### Part 2 — App actions: let Sidekick chain question → action

Build a shared `campaign-actions` extension that lets Sidekick open your existing
campaign pages pre-filled — edit first, then create, then the full win-back flow.
The action's intent `type` (`application/campaign`) matches the data result's
`mimeType`; that match is the join key.

| Step | Prompt (shortcut) | You build |
|---|---|---|
| Compose into an edit action | [`04`](prompts/04-compose-into-action.md) | create the `campaign-actions` folder + `open-campaign` edit action and register `design_email` in the editor route; Sidekick opens the pre-filled campaign and stages edits — the merchant reviews and sends |
| Add a create action | [`05`](prompts/05-create-campaign-action.md) | add `create-campaign` (`create:application/campaign` → `/app/campaigns/new`) to the same shared folder |
| Compose the win-back end to end | [`06`](prompts/06-create-winback-campaign-end-to-end.md) | update instructions so Sidekick runs the full flow: find lapsed → check/edit or create → stage email with `design_email` → merchant sends |

**Reference solution:** the
[`finished`](https://github.com/Shopify/dotdev-2026-sidekick-app-extensions/tree/finished)
branch has both builds complete; `main` is the starter you build from.

See [`starter/README.md`](starter/README.md) for the app layout and the one
cross-origin seam to verify on a dev store.

## Bringing your own app

The prompts assume this starter, but the moves transfer directly: expose a tool,
make its description and instructions legible to the model, return a
`resource_link` whose `mimeType` matches an action intent's `type`, and wire the
action. Where a step references a starter file (an endpoint or a route path),
map it to the equivalent in your app.

## Resources

**Sidekick app extensions docs (shopify.dev)**

- [Sidekick app extensions overview](https://shopify.dev/docs/apps/build/sidekick) — what Sidekick extensions are and when to reach for a data vs. action extension.
- [Surface app data](https://shopify.dev/docs/apps/build/sidekick/build-app-data) — the **data extension**: read-only tools, `resource_link` output (`uri` / `mimeType` / `_meta`), token & latency budgets, and authentication.
- [Surface app actions](https://shopify.dev/docs/apps/build/sidekick/build-app-actions) — the **action extension**: intents, supported types, URL placeholder mapping (`mapTo` / `fieldName`), in-page tools, and the end-to-end search → open → edit walkthrough.

**In this repo**

- [`prompts/`](prompts) — the six staged build prompts (three per part of the session).
- [`starter/README.md`](starter/README.md) — app layout, the two extensions, and the one cross-origin seam to verify on a dev store.

**Also useful**

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) — `shopify app dev` / `deploy` and `generate extension`.
- [Shopify Dev MCP server](https://shopify.dev/docs/apps/build/devmcp) — wire this into your AI coding assistant so it can look up current Shopify docs while you build (see `starter/.mcp.json`).
