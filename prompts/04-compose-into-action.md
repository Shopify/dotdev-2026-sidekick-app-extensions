We are implementing Build 2 of the Sidekick app extensions workshop (compose data into an action).

Start from the end-of-Build-1 app. The data extension now has `find_campaigns`, which returns existing campaign `resource_link` results with `mimeType: "application/campaign"` and stable `gid://application/campaign/<id>` URIs.

Goal: create a shared `campaign-actions` admin-link extension folder with an `edit-campaign` edit action, then register its in-page `design_email` tool in the campaign editor so Sidekick can chain: campaign resource → edit action → staged email copy changes. Keep the diff focused.

Campaign action intents operate on `application/campaign`, not on the email-copy fields directly. A campaign resource has only:

- `id`
- `name`
- `status`
- `customerIds`

Email copy fields (`subject`, `previewText`, `body`) belong only to the `design_email` tool schema.

## 1. Generate/create the shared `campaign-actions` admin link extension folder

Create a new extension folder at:

```txt
starter/extensions/campaign-actions/
```

It should hold admin-link action declarations for campaign workflows. In this step it contains the `edit-campaign` edit action; Build 3 adds the create action to the same folder so schemas, tools, and instructions can be shared.

Create `starter/extensions/campaign-actions/shopify.extension.toml`:

```toml
[[extensions]]
name = "Edit campaign"
description = "Edit a campaign so the merchant can review and send it."
handle = "edit-campaign"
type = "admin_link"

# For embedded apps, the url is relative to the app's application_url.
# The {id} placeholder is filled from the intent schema's value field via
# mapTo = "param" / fieldName = "id" in edit-campaign.json.
[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/campaigns/{id}/edit"

# Tools define what Sidekick can do once the editor page is open.
# Required: an intent with no tools is not registered.
tools = "./tools.json"
instructions = "./instructions.md"

[[extensions.targeting.intents]]
type = "application/campaign"
action = "edit"
schema = "./edit-campaign.json"
```

Important details:

- `type = "application/campaign"` is the join key. It MUST match the `mimeType` returned by `find_campaigns`.
- `action = "edit"` tells Sidekick this extension edits an existing campaign resource.
- `url = "/app/campaigns/{id}/edit"` opens the existing campaign editor route.
- `{id}` must be mapped by the intent schema's `value` field.
- Do not hardcode or guess a campaign id in the URL.

## 2. Add the edit campaign intent schema

Create `starter/extensions/campaign-actions/edit-campaign.json`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "The id of the campaign to edit. Sidekick may pass a gid://application/campaign/<id> resource URI; Admin strips it to the bare id before substituting {id}.",
    "mapTo": "param",
    "fieldName": "id"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/campaign.json",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Campaign name",
        "maxLength": 200
      },
      "status": {
        "type": "string",
        "description": "Campaign status"
      },
      "customerIds": {
        "type": "array",
        "description": "Customer ids included in this campaign",
        "items": {
          "type": "number"
        }
      }
    }
  }
}
```

Rules:

- Do not add `required` anywhere in the intent schema. Intent UI can ask the merchant for missing fields.
- Keep the `$ref` aligned with the intent type: `application/campaign`.
- Keep `value.mapTo = "param"` and `value.fieldName = "id"`, because the URL has `{id}`.
- Do not include `subject`, `previewText`, or `body` here. Those belong only to `design_email`.

## 3. Declare the in-page email-design tool

Create `starter/extensions/campaign-actions/tools.json`:

```json
[
  {
    "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
    "name": "design_email",
    "description": "Stage changes to the email copy for the campaign currently open in the form — subject, preview text, and/or body copy. Stages into the form only; the merchant reviews and clicks Save/Send.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string",
          "description": "New subject line",
          "maxLength": 200
        },
        "previewText": {
          "type": "string",
          "description": "New inbox preview text",
          "maxLength": 200
        },
        "body": {
          "type": "string",
          "description": "New email body copy"
        }
      }
    }
  }
]
```

This is an action-side tool: unlike data tools, it is allowed to affect app state. In this workshop, it should only stage changes into the visible form so the merchant stays in control.

## 4. Add action instructions

Create `starter/extensions/campaign-actions/instructions.md`:

```md
## Invoking the edit intent

Open a campaign only when you have a campaign resource from `find_campaigns`. The resource URI should look like `gid://application/campaign/<id>` and will open `/app/campaigns/<id>/edit`.

## When to use `design_email`

`design_email` is available only while a campaign editor is open. Use it when the merchant asks to change the campaign email's subject, preview text, or body — for example, "make the subject warmer" or "mention the 15% offer in the body".

## Important guidelines

- Only include the email fields the merchant asked to change; leave the others out.
- `design_email` stages email-copy changes into the form — it does not send.
- Tell the merchant to review and click Save/Send. Sidekick never sends a campaign silently.
- Confirm larger rewrites with the merchant before staging them.
```

## 5. Register `design_email` in the campaign editor UI

Update the campaign editor code so the tool declared above has a runtime handler.

If the app has a shared campaign form component, register in that component when it is used by the edit route. In the current starter shape, this is usually:

```txt
starter/app/components/CampaignForm.jsx
```

If your app still has the full form inline in the route, register in:

```txt
starter/app/routes/app.campaigns_.$id.edit.jsx
```

Complete the Build 2 TODOs in the form component:

1. Read `shopify.intents.request.value` and use any campaign fields from the intent request to seed the staged form edits.
2. Register the `design_email` runtime handler.

Add a small helper for the intent request payload. App intent requests can carry the schema input on `request.data`; keep the helper defensive so the form still works when no intent request is present:

```js
function stagedValuesFromIntentRequest(request) {
  const data = request?.data && typeof request.data === "object" ? request.data : request;

  if (!data || typeof data !== "object") {
    return {};
  }

  return {
    ...(typeof data.name === "string" ? { name: data.name } : {}),
    ...(Array.isArray(data.customerIds)
      ? { customerIds: data.customerIds.join("\n") }
      : {}),
  };
}
```

Then replace the staged-state TODO with intent-aware initialization. Keep the saved campaign as the baseline; apply intent data only to `staged` so it behaves like a proposed edit the merchant can review.

Important: do not read `shopify.intents` during render, inside `useMemo`, or inside a `useState` initializer. The app also renders on the server, and `shopify.intents` is only available in the browser. Read it inside an effect.

```js
const campaignState = useMemo(() => stateFromCampaign(campaign), [campaign]);
const [staged, setStaged] = useState(campaignState);
const [baseline, setBaseline] = useState(campaignState);

useEffect(() => {
  const intentStagedValues = stagedValuesFromIntentRequest(
    shopify.intents?.request?.value,
  );

  setStaged({ ...campaignState, ...intentStagedValues });
  setBaseline(campaignState);
}, [campaignState, shopify]);
```

If your form also stores `status` in `staged`, you may include `status` from the intent request too. If status is display-only, leave it out of the staged form state.

Register `design_email` inside a `useEffect`:

```js
useEffect(() => {
  if (!enableDesignTool) return undefined;

  const cleanup = shopify.tools.register("design_email", async (input) => {
    setStaged((prev) => ({ ...prev, ...input }));
    return { ok: true, note: "Staged in the form. Awaiting merchant Save." };
  });

  return () => cleanup?.();
}, [enableDesignTool, shopify]);
```

If the shared form is also used by `/app/campaigns/new`, only register this tool for the edit page in this step. A prop like `enableDesignTool` is fine.

Why stage instead of save: an action extension IS allowed to perform actions, but this workshop deliberately stages into the form so the merchant reviews the result and clicks Save/Send. Sidekick never saves or sends silently.

Campaign recipients are represented by `customerIds`; derive any displayed customer count from that list. Do not introduce a separate persisted segment label or persisted count.

Rules:

- Read `shopify.intents.request.value` inside `useEffect`, not during render, to avoid server-rendering errors.
- Keep the persisted campaign state as the baseline; intent-provided values are staged edits, not saved values.
- Register inside `useEffect` and return cleanup so the handler is torn down on unmount.
- Only stage into `setStaged`; do not save or send from the tool.
- The tool response should say it staged, not saved.
- Do NOT navigate anywhere from the tool handler (`useNavigate`, `<Link>`, redirect, or `window.location`). Any pathname change closes the intent modal.
- Keep the app on the same pathname while staging.

## 6. Run the end-to-end round trip

In Sidekick, ask to find an existing campaign to edit. Expected chain:

- Sidekick invokes `find_campaigns` and gets campaign `resource_link` results.
- Because a result's `mimeType` is `application/campaign`, matching the edit intent's `type`, Sidekick offers to open it.
- Sidekick invokes the `edit-campaign` edit intent with the resource `uri` as `value`.
- Shopify opens `/app/campaigns/<id>/edit` with the bare id substituted. A literal `{id}` means the `mapTo` / `fieldName` mapping is wrong.
- Ask Sidekick to change the email copy, such as "make the subject warmer".
- Sidekick invokes `design_email`, and the change stages into the form.
- The merchant reviews and clicks Save/Send. Sidekick never sends silently.

## Do not

- change the data extension in this step
- create, save, or send campaigns from the data tool
- add navigation inside the editor tool handler
- change the intent `type` away from `application/campaign`
- add `required` fields to the intent schema
- put `subject`, `previewText`, or `body` in the campaign intent schema

## Report

- exact files created/changed
- the `admin.app.intent.link` target URL
- the intent `action` and `type`
- confirmation that `application/campaign` matches `find_campaigns` resource-link `mimeType`
- whether Sidekick chained resource link → edit action, opened the editor at the bare id, staged via `design_email`, and left Save/Send to the merchant
