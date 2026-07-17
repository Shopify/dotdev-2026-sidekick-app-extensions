We are implementing Build 3 of the Sidekick app extensions workshop: add a create-campaign action.

Start from the app after prompt 04. You should already have a shared action extension folder:

```txt
starter/extensions/campaign-actions/
```

That folder contains the edit action (`open-campaign`) and shared action assets:

- `shopify.extension.toml`
- `edit-campaign.json` — edit schema WITH `value` mapping for `/app/campaigns/{id}/edit`
- `tools.json` — contains the `design_email` schema for `subject`, `previewText`, and `body`
- `instructions.md`

Goal: add a second admin-link action in the same shared `campaign-actions` folder:

1. `open-campaign` — `edit:application/campaign` → opens `/app/campaigns/{id}/edit`
2. `create-campaign` — `create:application/campaign` → opens `/app/campaigns/new`

The create action should open the existing app page:

```txt
/app/campaigns/new
```

It should not create, save, or send a campaign by itself. Sidekick opens/stages; the merchant reviews and clicks Create/Save/Send in the app UI.

A campaign resource has only:

- `id`
- `name`
- `status`
- `customerIds`

Email copy fields (`subject`, `previewText`, `body`) belong only to the `design_email` tool schema, not to the campaign action schemas.

If your previous step created `starter/extensions/open-campaign/`, rename/move that folder to:

```txt
starter/extensions/campaign-actions/
```

Keep the `open-campaign` extension handle for the edit action; only the folder name changes so edit and create can share files.

## 1. Add the create campaign schema

Create a second schema in the shared folder:

```txt
starter/extensions/campaign-actions/campaign-schema.json
```

This is the create schema. It describes campaign fields, but it does **not** include `value`, because `/app/campaigns/new` has no `{id}` placeholder and no existing campaign id.

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
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

Keep the edit schema as:

```txt
starter/extensions/campaign-actions/edit-campaign.json
```

`edit-campaign.json` must include the `value` mapping for `{id}`:

```json
"value": {
  "type": "string",
  "description": "The id of the campaign to edit. Sidekick may pass a gid://application/campaign/<id> resource URI; Admin strips it to the bare id before substituting {id}.",
  "mapTo": "param",
  "fieldName": "id"
}
```

Schema rules:

- Edit uses `edit-campaign.json` and has `value`.
- Create uses `campaign-schema.json` and does not have `value`.
- Both schemas use `application/campaign`.
- Both schemas use campaign fields only: `name`, `status`, and `customerIds`.
- Do not put `subject`, `previewText`, or `body` in either campaign schema.
- Do not add `required` anywhere.

## 2. Add the create action to the shared `shopify.extension.toml`

Update:

```txt
starter/extensions/campaign-actions/shopify.extension.toml
```

Keep the existing edit extension and add a second `[[extensions]]` block for create.

The final shape should be equivalent to:

```toml
[[extensions]]
name = "Open campaign"
description = "Edit a campaign so the merchant can review and send it."
handle = "open-campaign"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/campaigns/{id}/edit"
tools = "./tools.json"
instructions = "./instructions.md"

[[extensions.targeting.intents]]
type = "application/campaign"
action = "edit"
schema = "./edit-campaign.json"

[[extensions]]
name = "Create campaign"
description = "Open the new campaign form so the merchant can draft, review, and create it."
handle = "create-campaign"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/campaigns/new"
tools = "./tools.json"
instructions = "./instructions.md"

[[extensions.targeting.intents]]
type = "application/campaign"
action = "create"
schema = "./campaign-schema.json"
```

The key line for the create action is:

```toml
url = "/app/campaigns/new"
```

Rules:

- Both actions live in `starter/extensions/campaign-actions/`.
- Do not create a separate `extensions/create-campaign/` folder.
- Do not keep a separate `extensions/open-campaign/` folder after moving to the shared folder.
- Do not point create at `/app/campaigns/{id}/edit`.
- Do not require or invent a campaign id for create.
- Do not use `edit-campaign.json` for create, because that schema has `value`.
- Do not manually copy or invent `uid` values.

## 3. Reuse the shared email-design tool and instructions

Both actions reuse:

```txt
starter/extensions/campaign-actions/tools.json
starter/extensions/campaign-actions/instructions.md
```

`tools.json` should keep `subject`, `previewText`, and `body` only in the `design_email` tool schema:

```json
{
  "name": "design_email",
  "description": "Stage changes to the email copy for the campaign currently open in the form — subject, preview text, and/or body copy. Stages into the form only; the merchant reviews and clicks Create/Save/Send.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "subject": { "type": "string", "description": "New subject line", "maxLength": 200 },
      "previewText": { "type": "string", "description": "New inbox preview text", "maxLength": 200 },
      "body": { "type": "string", "description": "New email body copy" }
    }
  }
}
```

Update `instructions.md` so it describes both campaign actions:

```md
## Invoking the edit intent

Use the edit action when you have an existing campaign resource from `find_campaigns`. The resource URI looks like `gid://application/campaign/<id>` and opens `/app/campaigns/<id>/edit`.

## Invoking the create intent

Use the create action when the merchant wants a new campaign. It opens `/app/campaigns/new`.

## When to use `design_email`

`design_email` is available while either the campaign editor or create form is open. Use it when the merchant asks to draft or change the campaign email's subject, preview text, or body.

## Important guidelines

- Only include the email fields the merchant asked to change; leave the others out.
- `design_email` stages email-copy changes into the form — it does not create, save, or send.
- Tell the merchant to review and click Create/Save/Send. Sidekick never sends a campaign silently.
- Confirm larger rewrites with the merchant before staging them.
```

## 4. Ensure the create page exists and can stage edits

The create action should open the existing app page:

```txt
starter/app/routes/app.campaigns_.new.jsx
```

Confirm that route renders at:

```txt
/app/campaigns/new
```

The campaign form should use `customerIds` as the source of truth for who receives the campaign. Do not add or persist a segment-name string; derive any displayed customer count from `customerIds.length`.

`design_email` must be consistently available on both campaign action surfaces: edit and create. Clean up `CampaignForm` so it always registers the `design_email` tool when the form is mounted; do not keep an `enableDesignTool` prop or per-route opt-in.

The create route should render the shared form normally:

```jsx
<CampaignForm
  campaign={campaign}
  actionPath="/app/campaigns/new"
  heading="Create campaign"
  saveLabel="Create"
  successMessage="Campaign created (demo)"
/>
```

Rules for the shared handler:

- It may stage `subject`, `previewText`, and `body` into local form state through `design_email`.
- If the merchant changes recipients, store them as `customerIds` and derive the count from that list.
- It must not create, save, or send from the tool handler.
- It must not navigate from the tool handler.
- The normal Create button may navigate after the merchant clicks it.

## 5. Run both action round trips

```bash
cd starter
shopify app dev
```

Edit flow:

- Ask Sidekick to find an existing campaign to edit.
- Sidekick invokes `find_campaigns` and gets campaign `resource_link` results.
- Sidekick invokes the `open-campaign` edit intent with the resource `uri` as `value`.
- Shopify opens `/app/campaigns/<id>/edit` with the bare id substituted.

Create flow:

- Ask Sidekick to create a new campaign.
- Sidekick finds the `create-campaign` action for `create:application/campaign`.
- Shopify opens `/app/campaigns/new`.
- If Sidekick invokes `design_email`, the email-copy change stages into the create form.
- The merchant reviews and clicks Create. Sidekick never sends silently.

## Do not

- create a separate `extensions/create-campaign/` folder
- leave edit and create action assets split across separate folders
- point the create action anywhere except `/app/campaigns/new`
- use the edit schema with `value` for the create action
- require a campaign id for the create action
- put `subject`, `previewText`, or `body` in either campaign intent schema
- create, save, or send campaigns from the tool handler
- add navigation inside the tool handler
- change the intent `type` away from `application/campaign`
- add `required` fields to either schema

## Report

- exact files changed
- confirmation that both action extensions live in `extensions/campaign-actions/`
- confirmation that `shopify.extension.toml` declares two extensions: edit and create
- edit target URL: `/app/campaigns/{id}/edit`
- create target URL: `/app/campaigns/new`
- edit schema: `./edit-campaign.json` with `value` mapping
- create schema: `./campaign-schema.json` without `value`
- confirmation that campaign schemas contain only campaign fields (`name`, `status`, `customerIds`) and `design_email` contains email-copy fields (`subject`, `previewText`, `body`)
- confirmation that Sidekick opened `/app/campaigns/new` for the create action
