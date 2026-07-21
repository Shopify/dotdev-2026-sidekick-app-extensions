We are implementing Build 1, Step 3 of 3 of the Sidekick app extensions workshop (shape the payload for composition).

Start from the Build 1 Step 2 app. The capability is now legible, but lapsed-customer data alone is not something Sidekick can open in the app. The SHAPE of what you return determines what Sidekick can do next.

Goal: add a read-only data tool called `find_campaigns` that returns the app's existing campaigns as `resource_link` results Sidekick can act on. Keep the diff small.

Data tools are READ-ONLY. Shopify's docs say a data extension "must only be used for retrieving data from your app" — so `find_campaigns` lists existing campaigns and never creates, updates, saves, or sends a campaign. Creating a new campaign or editing campaign copy belongs in the app UI / action side, where the merchant remains in control.

The join key: each resource link's `mimeType` MUST match the action intent's `type`. The campaign actions declare `type = "application/campaign"`, so campaign resource links must use `mimeType: "application/campaign"` and a `uri` of the form `gid://application/campaign/<campaignId>`.

A campaign resource has only these campaign fields:

- `id`
- `name`
- `status`
- `customerIds`

Email content fields (`subject`, `previewText`, `body`) are not part of the campaign resource schema. They belong only to the action-side `design_email` tool schema.

1. Update `starter/extensions/winback-tools/tools.json`.

Add a `find_campaigns` tool (keep `find_lapsed_customers`). Declare an `outputSchema` describing a `results` array of resource links. Each result should include:

- `type` — always `resource_link`
- `uri` — `gid://application/campaign/<campaignId>`
- `name` — human-readable campaign name
- `mimeType` — always `application/campaign`
- `_meta` — compact campaign metadata: `id`, `status`, and `customerIds`

Give the tool a clear description like: "Find existing campaigns that can be opened for editing."

Optional input is okay, but keep it simple. If you add input fields, use only lightweight filters such as `status` or `limit`. Do not add `required` unless absolutely necessary.

Campaigns do not persist a segment label or count. `customerIds` is the source of truth, and any displayed customer count should be derived from `customerIds.length`.

2. Update `starter/extensions/winback-tools/src/index.js`.

Register `find_campaigns`. It should retrieve existing campaigns from the app, then return them as resource links.

If the app does not already expose a read-only campaigns JSON endpoint, add the smallest possible read-only endpoint that returns `listCampaigns()`; do not create or mutate campaigns from the data tool.

Example shape for the tool callback:

```js
shopify.tools.register("find_campaigns", async ({ status, limit = 10 } = {}) => {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, limit }),
  });

  if (!res.ok) {
    throw new Error(`Failed to load campaigns: ${res.status}`);
  }

  const { campaigns } = await res.json();

  return {
    results: campaigns.map((campaign) => ({
      type: "resource_link",
      uri: `gid://application/campaign/${campaign.id}`,
      name: campaign.name,
      mimeType: "application/campaign",
      _meta: {
        id: String(campaign.id),
        status: campaign.status,
        customerIds: campaign.customerIds,
      },
    })),
  };
});
```

Rules:

- The tool is READ-ONLY — it lists existing campaigns and never writes.
- Return campaign results as `resource_link` objects in a `results` array.
- Each `uri` must be a stable `gid://application/campaign/<id>` — Sidekick strips it to the bare id when substituting `{id}` in the action's url.
- Each `mimeType` must be exactly `application/campaign` (the join key).
- Do not include `subject`, `previewText`, or `body` in the campaign resource. Those belong to `design_email`.
- Keep `_meta` compact — the whole response must stay under 4,000 tokens (~16,000 chars) and return in ~1s, or it's rejected/skipped.
- Cap the number of campaigns returned by default (for example, `limit = 10`) so the response stays within budget.
- Do not include a segment-name string or persisted count; use `customerIds` and derive customer count from it when displaying.
- Do not change `find_lapsed_customers` beyond any shared helper refactor needed.
- Do not change the action extension in this step.
- Do not change the intent `type` on the action extension.

3. Update `starter/extensions/winback-tools/instructions.md` so Sidekick knows:

- use `find_lapsed_customers` when the merchant asks about lapsed/win-back customers;
- use `find_campaigns` when the merchant asks to find, open, edit, improve, or reuse an existing campaign;
- `find_campaigns` returns campaign resources that can be paired with the campaign edit action;
- Sidekick should offer to open/edit a returned campaign rather than pretending the data tool edited it.

Expected: `find_campaigns` returns existing campaign resource links with stable `uri` values, `mimeType: "application/campaign"`, and compact `_meta`, well within budget. Given a campaign-opening or campaign-editing goal, Sidekick now has resources it can carry to the campaign edit action.

Do not:

- wire or change the action route (that's Build 2 — prompt 04)
- create, update, save, or send campaigns from the data tool
- exceed the token/latency budget
- change the intent `type` on the action extension

Report:

- exact files changed
- the exact `uri` format and `mimeType` returned
- confirmation the result size is capped and within budget
