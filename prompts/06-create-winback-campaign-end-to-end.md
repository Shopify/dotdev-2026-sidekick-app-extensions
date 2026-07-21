We are implementing Build 4 of the Sidekick app extensions workshop: create a win-back campaign end-to-end.

Start from the app after prompt 05. You should already have:

- a data extension with:
  - `find_lapsed_customers` — returns lapsed customers, including their `id` values;
  - `find_campaigns` — returns existing campaign resources with `mimeType: "application/campaign"` and `customerIds` metadata;
- a shared campaign action extension folder:
  - `starter/extensions/campaign-actions/`
- campaign actions:
  - `edit:application/campaign` — opens `/app/campaigns/{id}/edit`;
  - `create:application/campaign` — opens `/app/campaigns/new`;
- a `design_email` action tool available on both edit and create campaign forms.

Goal: update only the instruction files so Sidekick understands the full workflow for creating a win-back campaign:

1. Find lapsed customers.
2. Check whether an existing campaign already targets those customers.
3. If an existing campaign includes those lapsed customer ids, open/edit it.
4. If no existing campaign includes them, create a new campaign with those `customerIds` using `create:application/campaign`.
5. Use `design_email` to stage the win-back email copy.
6. Leave final Create/Save/Send to the merchant.

Do not add new tools, endpoints, schemas, or routes in this step. This step is about teaching Sidekick how to compose the tools/actions it already has.

## 1. Update the data-tool instructions

Update:

```txt
starter/extensions/winback-tools/instructions.md
```

Teach Sidekick that the data extension provides both customer targeting data and current campaign data.

Use content like:

```md
## Win-back campaign workflow

Use these tools when the merchant wants to win back, re-engage, or target customers who have not ordered recently.

### Step 1 — Find lapsed customers

Call `find_lapsed_customers` first. Use the merchant's requested lapsed window when provided; otherwise use the app default. The returned customers are the targeting source for the campaign.

Extract the customer ids from the returned `customers` list:

- `customers[].id`

These ids become the `customerIds` for a campaign.

If results are paginated and the merchant wants the full target set, continue paging until all desired customers are collected. Keep within tool response limits.

### Step 2 — Check existing campaigns

Call `find_campaigns` to list current campaigns. Campaign resources use:

- `mimeType: "application/campaign"`
- `uri: "gid://application/campaign/<id>"`
- `_meta.customerIds` as the recipient source of truth

Compare the lapsed customer ids from `find_lapsed_customers` with each campaign's `_meta.customerIds`.

If an existing campaign already contains the lapsed customer ids the merchant wants to target, offer to open that campaign using the `edit:application/campaign` action.

If no existing campaign contains those lapsed customer ids, offer to create a new campaign using `create:application/campaign` and pass the collected lapsed ids as `customerIds`.

### Step 3 — Create or open the campaign

Use `edit:application/campaign` when editing an existing campaign resource from `find_campaigns`.

Use `create:application/campaign` when creating a new campaign. Include:

- `name` — a clear campaign name, such as "Win-back — lapsed 90 days"
- `customerIds` — the lapsed customer ids collected from `find_lapsed_customers`
- `status` — `DRAFT` if provided

Do not invent an audience or segment label. `customerIds` is the source of truth.

### Step 4 — Draft the email copy

After the campaign form is open, use the action-side `design_email` tool to stage email copy fields:

- `subject`
- `previewText`
- `body`

Do not put email-copy fields in the campaign resource. Campaign actions use `application/campaign`; email copy is staged through `design_email`.

### Merchant control

Never save, create, or send silently. Tell the merchant to review the form and click Create/Save/Send.
```

Rules:

- Be explicit that `find_lapsed_customers` supplies customer ids for targeting.
- Be explicit that `find_campaigns` lists current campaigns and exposes their `customerIds`.
- Be explicit that Sidekick should compare lapsed customer ids to campaign `customerIds` before deciding whether to edit or create.
- Be explicit that missing coverage should use `create:application/campaign` with `customerIds`.
- Do not mention an audience string or segment label as persisted data.

## 2. Update the campaign action instructions

Update:

```txt
starter/extensions/campaign-actions/instructions.md
```

Teach the action extension how it participates in the same workflow.

Use content like:

```md
## Campaign actions

These actions operate on `application/campaign` resources.

A campaign has:

- `id`
- `name`
- `status`
- `customerIds`

Email copy is not part of the campaign intent schema. Use `design_email` for `subject`, `previewText`, and `body` after the campaign form is open.

## Edit existing campaign

Use `edit:application/campaign` when Sidekick has an existing campaign resource from `find_campaigns`.

The resource URI looks like:

`gid://application/campaign/<id>`

Opening it navigates to `/app/campaigns/<id>/edit`.

## Create new campaign

Use `create:application/campaign` when the merchant wants a new campaign or when no existing campaign contains the target `customerIds`.

For a win-back campaign, pass the lapsed customer ids from `find_lapsed_customers` as `customerIds`.

Example create intent data:

```json
{
  "name": "Win-back — lapsed 90 days",
  "status": "DRAFT",
  "customerIds": [1000001, 1000002, 1000003]
}
```

The create action opens `/app/campaigns/new`.

## Design email copy

Use `design_email` only after the edit or create campaign form is open.

Stage only the email-copy fields the merchant asked for:

- `subject`
- `previewText`
- `body`

For a win-back campaign, draft copy that invites lapsed customers back, but do not save or send automatically.

## Merchant control

`design_email` stages changes into the form. It does not create, save, or send.

Tell the merchant to review and click Create/Save/Send. Sidekick never sends silently.
```

Rules:

- Keep the action instructions focused on `application/campaign`.
- Keep `subject`, `previewText`, and `body` scoped to `design_email`.
- Say that `create:application/campaign` opens `/app/campaigns/new`.
- Say that create receives `customerIds` from `find_lapsed_customers` for the win-back workflow.
- Do not add tool schemas or action schemas in this step.

## 3. Test the intended Sidekick plan

Run:

```bash
cd starter
shopify app dev
```

Ask Sidekick:

```txt
Create a win-back campaign for customers who haven't ordered in 90 days.
```

Expected plan:

1. Sidekick calls `find_lapsed_customers`.
2. Sidekick extracts `customers[].id` as target `customerIds`.
3. Sidekick calls `find_campaigns`.
4. Sidekick compares lapsed customer ids with each campaign's `_meta.customerIds`.
5. If a campaign already targets those customers, Sidekick offers to open/edit it via `edit:application/campaign`.
6. If no campaign targets those customers, Sidekick invokes `create:application/campaign` with the lapsed `customerIds`.
7. Shopify opens `/app/campaigns/new` for create or `/app/campaigns/<id>/edit` for edit.
8. Sidekick uses `design_email` to stage `subject`, `previewText`, and/or `body`.
9. The merchant reviews and clicks Create/Save/Send.

## Do not

- add new tools
- add new endpoints
- change schemas
- change action URLs
- persist an audience/segment label
- save, create, or send from a tool handler

## Report

- exact files changed
- the workflow Sidekick followed
- whether it used `find_lapsed_customers` first
- whether it checked existing campaigns with `find_campaigns`
- whether it chose edit or create correctly based on `customerIds`
- whether `design_email` staged email copy and left final Create/Save/Send to the merchant
