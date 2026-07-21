We are implementing Build 1, Step 1 of 3 of a Sidekick app extensions workshop: expose a read-only data tool.

Scenario: a demo email-marketing app. The merchant's goal is "help me win back customers who haven't ordered in 90 days." In this part, expose the app's lapsed-customer lookup capability to Sidekick and watch it hit a ceiling.

Goal: replace the placeholder tool in the `winback-tools` data extension with a working `find_lapsed_customers` tool, keeping the diff as small as possible.

Important: this is the FLOOR version on purpose. Return plain customer data from the app API and nothing Sidekick can act on yet. Do NOT touch `extensions_summary`, the extension `description`, `instructions.md`, or the payload shape beyond matching the API response — those are Build 1 Steps 2–3 (prompts 02–03). Leave them vague for now; that's the lesson.

Make only the changes below.

## 1. Update `starter/extensions/winback-tools/tools.json`

Replace the `placeholder` tool with:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
  "name": "find_lapsed_customers",
  "description": "Find customers who have not placed an order in a given number of days. Results are paginated.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "daysSinceLastOrder": { "type": "number" },
      "page": { "type": "number" },
      "pageSize": { "type": "number" }
    }
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "days": {
        "type": "number",
        "description": "The days-since-last-order threshold used."
      },
      "count": {
        "type": "number",
        "description": "The total number of lapsed customers found across all pages."
      },
      "page": {
        "type": "number",
        "description": "The returned 1-based page number."
      },
      "pageSize": {
        "type": "number",
        "description": "The number of customers requested per page."
      },
      "totalPages": {
        "type": "number",
        "description": "The total number of pages available."
      },
      "hasNextPage": {
        "type": "boolean",
        "description": "Whether another page is available after this one."
      },
      "hasPreviousPage": {
        "type": "boolean",
        "description": "Whether another page is available before this one."
      },
      "customers": {
        "type": "array",
        "description": "The lapsed customers for the returned page.",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "number" },
            "name": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" },
            "city": { "type": "string" },
            "ordersCount": { "type": "number" },
            "totalSpent": { "type": "number" },
            "createdAt": { "type": "string" },
            "lastOrderedAt": { "type": "string" },
            "daysSinceOrder": { "type": "number" },
            "notes": { "type": "string" }
          }
        }
      }
    }
  }
}
```

`daysSinceLastOrder`, `page`, and `pageSize` are optional. The app API applies defaults. Keep the input schema intentionally minimal in this first step; Prompt 02 adds model-facing input descriptions.

## 2. Update `starter/extensions/winback-tools/src/index.js`

Register `find_lapsed_customers`. It calls the app's lapsed-customer endpoint and returns the API response as-is:

```js
export default async function extension() {
  shopify.tools.register("find_lapsed_customers", async (input) => {
    const response = await fetch("/api/customers/lapsed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input ?? {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to load lapsed customers: ${response.status}`);
    }

    return response.json();
  });
}
```

Remove the `placeholder` registration.

Rules:

- Tools run client-side in the sandbox and must return JSON in under ~1s.
- Match the `/api/customers/lapsed` response shape: `days`, `count`, pagination fields, and `customers`.
- Do not add a `results` / `resource_link` envelope yet — that's Build 1, Step 3 (prompt 03).
- Do not change any other file.

Cross-origin note: the tool runs in Shopify's sandbox (`https://extensions.shopifycdn.com`), so `/api/customers/lapsed` is a cross-origin call handled by the app's `cors` helper. If the fetch cannot authenticate in your environment, the fallback is to bundle the data into the extension by importing the shared customer seed and filtering it client-side. If you use the fallback, keep the SAME return shape.

## 3. Run dev

```bash
cd starter
shopify app dev --use-localhost
```

Open the dev store directly in the browser.

## 4. Observe the ceiling

In Sidekick:

- Ask the single question: "who hasn't ordered in 90 days?" → you get lapsed-customer data.
- Then give the goal: "help me win back customers who haven't ordered in 90 days" → Sidekick answers the lookup and STALLS. There's no stable handle to a resource and no signal about what to do next.

Do not:

- edit `shopify.app.toml`, the extension `description`, or `instructions.md`
- add a `resource_link` payload
- wire the action extension
- add unrelated abstractions

Report:

- exact files changed
- what Sidekick did for the question vs. the goal (the ceiling)
