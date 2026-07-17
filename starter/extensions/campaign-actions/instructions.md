## Full win-back campaign workflow

When the merchant wants to create or plan a win-back campaign:

1. Use `find_lapsed_customers` to find customers who have not ordered recently.
2. Use `find_campaigns` to check whether an existing campaign already targets those customers.
3. Compare lapsed customer `id` values with each campaign result's `_meta.customerIds`.
4. If an existing campaign includes those lapsed customer ids, invoke the edit action for that campaign resource.
5. If no existing campaign includes them, invoke `create:application/campaign` with `customerIds` set to the lapsed customer ids.
6. After the edit or create form opens, use `design_email` to stage win-back email copy.
7. Leave final Create/Save/Send to the merchant.

## Invoking the edit intent

Use the edit action when you have an existing campaign resource from `find_campaigns`. The resource URI looks like `gid://application/campaign/<id>` and opens `/app/campaigns/<id>/edit`.

Use edit instead of create when the campaign's `_meta.customerIds` already includes the lapsed customer ids the merchant wants to target.

## Invoking the create intent

Use the create action when the merchant wants a new campaign or no existing campaign includes the lapsed customer ids. It opens `/app/campaigns/new`.

For win-back campaigns, pass the lapsed customer ids as `customerIds` on the `create:application/campaign` request. Do not invent a campaign id for create.

## When to use `design_email`

`design_email` is available while either the campaign editor or create form is open. Use it after opening edit or create when the merchant asks to draft or change the campaign email's subject, preview text, or body.

For win-back email copy, focus on re-engaging inactive customers. Only include the email fields the merchant asked to change; leave the others out.

## Important guidelines

- `design_email` stages email-copy changes into the form — it does not create, save, or send.
- Tell the merchant to review and click Create/Save/Send. Sidekick never sends a campaign silently.
- Confirm larger rewrites with the merchant before staging them.
- Campaign recipients come from `customerIds`; do not use a segment label or separate count.
