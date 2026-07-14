import { readFileSync } from "node:fs";

const seed = JSON.parse(
  readFileSync(new URL("../../shared/customers.json", import.meta.url), "utf8"),
);

/**
 * The workshop app is an email-marketing app. Its "audience" is a synthetic
 * dataset of 100 customers (shared/customers.json) with order history.
 *
 * The seed file has `ordersCount` and `createdAt` but no last-order date, so we
 * derive a deterministic `lastOrderedAt` per customer (spread across the last
 * ~200 days, seeded off the id) — that gives us a realistic mix of active and
 * *lapsed* customers to power the "haven't ordered in 90 days" scenario without
 * hand-editing 100 records. Swap this for real data if you bring your own app.
 */
function deriveLastOrderedAt(id, ordersCount) {
  // Deterministic pseudo-spread: 5–205 days ago, biased so lower-order-count
  // customers tend to have lapsed longer. Stable across restarts.
  const base = (id * 37) % 200;
  const lapsedBias = ordersCount < 8 ? 60 : 0;
  const daysAgo = Math.min(205, 5 + base + lapsedBias);
  const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

function getStore() {
  if (!globalThis.__customerStore) {
    globalThis.__customerStore = new Map(
      seed.map((customer) => [
        customer.id,
        {
          ...customer,
          lastOrderedAt: deriveLastOrderedAt(
            customer.id,
            customer.ordersCount,
          ),
        },
      ]),
    );
  }
  return globalThis.__customerStore;
}

export function getCustomer(id) {
  return getStore().get(id);
}

export function listCustomers() {
  return Array.from(getStore().values()).sort((a, b) => a.id - b.id);
}

export function daysSince(iso) {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000),
  );
}

/**
 * Customers who haven't ordered within `days` days — the lapsed audience.
 * Sorted by longest-lapsed first.
 */
export function listLapsedCustomers(days = 90) {
  return listCustomers()
    .filter((customer) => daysSince(customer.lastOrderedAt) >= days)
    .sort(
      (a, b) =>
        new Date(a.lastOrderedAt).getTime() -
        new Date(b.lastOrderedAt).getTime(),
    );
}
