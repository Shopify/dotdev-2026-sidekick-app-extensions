## When to use these tools

Use `find_lapsed_customers` when the merchant wants to find, list, target, or re-engage customers who have not ordered recently.

Relevant merchant language includes:

- "lapsed customers"
- "customers who haven't ordered"
- "haven't purchased in 90 days"
- "win back customers"
- "re-engage inactive customers"

If the merchant provides a time window, pass it as `daysSinceLastOrder`. If they do not provide a time window, let the tool use its default.

Use `find_campaigns` when the merchant wants to find, open, edit, improve, reuse, or review an existing campaign. Also use it during win-back campaign planning to check whether an existing campaign already targets the lapsed customers. If the merchant provides a status, pass it as `status`. Use `limit` to keep results small.

## Win-back campaign workflow

When the merchant asks to create or plan a win-back campaign:

1. Call `find_lapsed_customers` to get the lapsed customer audience.
2. Extract the lapsed customer `id` values from the returned `customers` list.
3. Call `find_campaigns` to inspect existing campaign resources.
4. Compare the lapsed customer ids with each campaign result's `_meta.customerIds`.
5. If an existing campaign includes those lapsed customer ids, offer to open or edit that campaign using its `resource_link` result.
6. If no existing campaign includes them, use the `create:application/campaign` action with `customerIds` set to the lapsed customer ids.
7. Once the edit or create form is open, use `design_email` to stage the win-back email copy.
8. Leave final Create/Save/Send to the merchant.

Do not claim a data tool created or edited a campaign. Data tools only find customers and campaign resources.

## What the tools return

`find_lapsed_customers` returns the app's lapsed-customer API response:

- `days` — the days-since-last-order threshold used
- `count` — total lapsed customers across all pages
- `page` — the returned 1-based page number
- `pageSize` — the number of customers requested per page
- `totalPages` — the total number of pages available
- `hasNextPage` — whether another page is available after this one
- `hasPreviousPage` — whether another page is available before this one
- `customers` — the lapsed customers for the returned page

Each item in `customers` can include `id`, `name`, `email`, `phone`, `city`, `ordersCount`, `totalSpent`, `createdAt`, `lastOrderedAt`, `daysSinceOrder`, and `notes`.

If the merchant asks for more customers and `hasNextPage` is true, call the tool again with the next `page` value. Keep responses small by respecting `pageSize`.

`find_campaigns` returns a `results` array of campaign `resource_link` objects. Each campaign result includes:

- `type` — `resource_link`
- `uri` — `gid://application/campaign/<campaignId>`
- `name` — the campaign name
- `mimeType` — `application/campaign`
- `_meta` — compact metadata with `id`, `status`, and `customerIds`

Campaign resource links can be paired with the campaign edit action because their `mimeType` is `application/campaign`. Use `_meta.customerIds` to decide whether a campaign already targets the lapsed customers.

## Limits

These tools are read-only. They only find lapsed customers and existing campaigns.

They do not create, edit, save, send, or propose campaigns. Use campaign actions for create/edit workflows, use `design_email` only after a campaign form is open, and leave final Create/Save/Send to the merchant.
