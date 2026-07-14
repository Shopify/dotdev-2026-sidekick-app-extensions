# Win-back — Sidekick workshop starter app

A minimal, embedded **email-marketing app** built on the Shopify
[React Router app template](https://github.com/Shopify/shopify-app-template-react-router).
It ships with everything you need to start the DotDev Sidekick workshop at the
exercise — not at "install Node."

You **hand-build** the two extensions during the workshop and
test them through Sidekick on a dev store. A complete reference solution is on
the
[`finished`](https://github.com/shopify-playground/dotdev-2026-sidekick-app-extensions/tree/finished)
branch.

## What's in here

```
app/
  data/
    customers.server.js     synthetic 100-customer audience + lapsed helpers
    campaigns.server.js     in-memory email campaigns
  routes/
    app._index.jsx          app home
    app.campaigns.jsx       campaign list
    app.campaigns_.$id.edit.jsx   campaign editor (Sidekick opens this)
    app.customers.jsx       read-only "Audience" view (who's lapsed)
    api.audiences.lapsed.js       POST -> paginated lapsed customers
shared/
  customers.json            audience seed data
  campaigns.json            campaign seed data
extensions/
  winback-tools/            data extension  (admin.app.tools.data)   ← Build 1
  open-campaign/            action extension (admin.app.intent.link) ← Build 2
```

## Extensions: what ships vs. what you build

- **`winback-tools`** ships as a generated scaffold with a placeholder tool. In
  **Build 1** you build it up (register `find_lapsed_customers`, then make it
  legible, then reshape its payload into a `resource_link`).
- **`open-campaign`** ships **complete** (intent + schema + `design_email`
  tool). In **Build 2** you connect it by registering the `design_email` handler
  in the campaign editor route.

## The one thing to verify on a dev store (backend calls from the sandbox)

Sidekick data tools run in a sandbox at `https://extensions.shopifycdn.com`, so
a tool calling `/api/customers/lapsed` is a **cross-origin** call to this app's
backend. The API routes wrap responses with the `cors` helper from
`authenticate.admin` (managed install / token exchange). If the sandbox fetch
can't authenticate in your setup, the reliable fallback is to **bundle the data
into the extension** (import the shared JSON directly in
`extensions/winback-tools/src/index.js`) — the teaching points (payload shape,
`mimeType`, `_meta`, token budget) are identical either way. Verify this end to
end before the session.

## Requirements

- **Shopify CLI 4+** (`shopify version`).
- Node.js (see `engines` in `package.json`) and npm.
- A **development store with Sidekick** enabled, and a Partner org you can create
  an app in.
- An AI coding assistant with the Shopify Dev MCP server (see
  `.vscode/mcp.json` / `.mcp.json`).

## Get started

```bash
cd starter
npm install
shopify app dev     # link to your app/dev store; confirm the embedded app loads
```

If the placeholder `client_id` blocks linking, run `shopify app dev --reset`.

> Deploy the extensions with `shopify app deploy` **before** testing in Sidekick
> — the dev-store preview won't pick up tool/intent changes until you deploy.
> Open the dev store directly in the browser (the `p` CLI shortcut isn't
> supported for Sidekick extensions yet).

Then start **Build 1** — hand-build `find_lapsed_customers`.
