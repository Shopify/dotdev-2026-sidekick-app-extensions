We are implementing Build 1, Step 2 of 3 of the Sidekick app extensions workshop: make the lapsed-customer data capability legible.

Start from the Build 1 Step 1 app. It has a working `find_lapsed_customers` tool in the `winback-tools` extension that returns the `/api/customers/lapsed` response shape, plus deliberately vague app and extension descriptions.

Goal: make the capability legible to the agent so Sidekick reliably selects `find_lapsed_customers` for lapsed-customer and win-back goals. The descriptions and instructions are part of the API the model uses — vague or inaccurate text won't get invoked, and descriptions are scanned by the content/safety check at deploy.

Make the smallest possible diff. Do NOT change tool code or the return shape yet. Resource-link composition is Build 1, Step 3 — prompt 03.

## 1. Update `starter/extensions/winback-tools/tools.json`

Add model-facing descriptions to the existing `find_lapsed_customers` input fields. Do not change the tool name, output schema, return shape, or runtime behavior.

Update only the `inputSchema.properties` for these optional fields:

```json
"daysSinceLastOrder": {
  "type": "number",
  "description": "Optional minimum number of days since the customer's last order. Defaults to 90."
},
"page": {
  "type": "number",
  "description": "Optional 1-based page number to return. Defaults to 1."
},
"pageSize": {
  "type": "number",
  "description": "Optional number of customers per page. Defaults to 25 and is capped at 50."
}
```

## 2. Update `starter/shopify.app.toml`

Rewrite the app-level Sidekick summary so it names the capability and domain clearly. Keep it concise; this field has a small token budget.

Use:

```toml
[sidekick]
extensions_summary = "Find lapsed customers for email marketing and win-back campaign planning."
```

## 3. Update `starter/extensions/winback-tools/shopify.extension.toml`

Tighten the extension `description` so the model knows what the data capability is for and when to use it:

```toml
description = "Find customers who have not ordered in a given number of days. Use when the merchant wants to identify lapsed customers or plan a win-back campaign."
```

Do not say the extension creates, edits, saves, sends, or proposes campaigns. This step exposes read-only customer lookup data only.

## 4. Update `starter/extensions/winback-tools/instructions.md`

Write it FOR THE MODEL: when this applies, what the tool returns, and what it does not do yet.

Use content like:

```md
## When to use this tool

Use `find_lapsed_customers` when the merchant wants to find, list, target, or re-engage customers who have not ordered recently.

Relevant merchant language includes:

- "lapsed customers"
- "customers who haven't ordered"
- "haven't purchased in 90 days"
- "win back customers"
- "re-engage inactive customers"

If the merchant provides a time window, pass it as `daysSinceLastOrder`. If they do not provide a time window, let the tool use its default.

## What it returns

`find_lapsed_customers` returns the app's lapsed-customer API response:

- `days` — the days-since-last-order threshold used
- `count` — total lapsed customers across all pages
- `page` — the returned 1-based page number
- `pageSize` — the number of customers requested per page
- `totalPages` — the total number of pages available
- `hasNextPage` — whether another page is available after this one
- `hasPreviousPage` — whether another page is available before this one
- `customers` — the lapsed customers for the returned page

Each item in `customers` can include:

- `id`
- `name`
- `email`
- `phone`
- `city`
- `ordersCount`
- `totalSpent`
- `createdAt`
- `lastOrderedAt`
- `daysSinceOrder`
- `notes`

If the merchant asks for more customers and `hasNextPage` is true, call the tool again with the next `page` value. Keep responses small by respecting `pageSize`.

## Limits

This tool is read-only. It only finds lapsed customers.

It does not create, edit, save, send, or propose campaigns. It does not return `resource_link` results yet. If the merchant wants to act on these customers, summarize the customer results and ask what they want to do next.
```

Rules:

- Refer to the capability by its actual tool name: `find_lapsed_customers`.
- Describe the real response shape: `days`, `count`, pagination fields, and `customers`.
- Do not say the tool returns a `sample`; it returns paginated `customers`.
- Do not claim the tool creates, edits, proposes, saves, or sends campaigns.
- Do not mention `resource_link` as available yet.

## 5. Update `starter/extensions/winback-tools/locales/en.default.json` if needed

Update the locale file only if the merchant-facing `name` or `description` still reads as a placeholder.

Keep the text short and capability-focused, for example:

```json
{
  "name": "Customer insights",
  "description": "Find lapsed customers for email marketing."
}
```

Expected: an OK Sidekick event in the Dev Dashboard logs (`extensions/security_scan`).

Now ask Sidekick a lapsed-customer or win-back goal WITHOUT naming the app — it should select `find_lapsed_customers` on its own. A vague or policy-violating description may be skipped or blocked and show an Error event.

Do not:

- change `src/index.js` or `tools.json` behavior beyond adding input descriptions
- add a `resource_link` payload — that's Build 1, Step 3 (prompt 03)
- wire an action extension
- write promotional or steering copy in descriptions; the safety scan can block it

Report:

- exact files changed
- whether the deploy passed the safety scan (OK vs Error event)
- whether Sidekick now selects `find_lapsed_customers` without being told the app name
