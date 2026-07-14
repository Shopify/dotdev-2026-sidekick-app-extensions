import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import {
  daysSince,
  listCustomers,
  listLapsedCustomers,
} from "../data/customers.server";

/**
 * Read-only "Audience" view. It shows the synthetic customer dataset and flags
 * who is lapsed (90+ days since last order) — the audience a win-back campaign
 * targets. There is no edit action here; the workshop's Sidekick action lives
 * on the campaign editor, not the customer record.
 */
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const lapsedIds = new Set(listLapsedCustomers(90).map((c) => c.id));
  const customers = listCustomers().map((c) => ({
    ...c,
    lapsed: lapsedIds.has(c.id),
    daysSinceOrder: daysSince(c.lastOrderedAt),
  }));
  return { customers, lapsedCount: lapsedIds.size };
};

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function Audience() {
  const { customers, lapsedCount } = useLoaderData();

  return (
    <s-page heading="Customers">
      <s-section
        heading={`${customers.length} customers · ${lapsedCount} lapsed (90+ days)`}
      >
        <s-table>
          <s-table-header-row>
            <s-table-header>Name</s-table-header>
            <s-table-header>Email</s-table-header>
            <s-table-header>Orders</s-table-header>
            <s-table-header>Total spent</s-table-header>
            <s-table-header>Days since order</s-table-header>
            <s-table-header>Status</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {customers.slice(0, 50).map((c) => (
              <s-table-row key={c.id}>
                <s-table-cell>{c.name}</s-table-cell>
                <s-table-cell>{c.email}</s-table-cell>
                <s-table-cell>{c.ordersCount}</s-table-cell>
                <s-table-cell>{formatMoney(c.totalSpent)}</s-table-cell>
                <s-table-cell>{c.daysSinceOrder}</s-table-cell>
                <s-table-cell>
                  {c.lapsed ? (
                    <s-badge tone="warning">Lapsed</s-badge>
                  ) : (
                    <s-badge tone="success">Active</s-badge>
                  )}
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
        <s-paragraph>Showing the first 50 of {customers.length}.</s-paragraph>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
