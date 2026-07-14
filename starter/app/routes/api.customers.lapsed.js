import { authenticate } from "../shopify.server";
import { daysSince, listLapsedCustomers } from "../data/customers.server";

/**
 * POST /api/customers/lapsed  ->  { count, days, page, pageSize, totalPages, customers }
 *
 * The "find lapsed customers" capability the winback-tools data extension calls.
 * Returns the size of the lapsed audience plus one page of matching customers.
 *
 * ── Cross-origin note (VERIFY on a dev store) ─────────────────────────────────
 * Sidekick data tools run in a sandbox at https://extensions.shopifycdn.com, so
 * calls to this backend are cross-origin. We wrap responses with the
 * `cors` helper from `authenticate.admin` (managed install / token exchange).
 * If the sandbox fetch can't authenticate in your environment, the reliable
 * fallback is to bundle the data into the extension (import the shared JSON in
 * extensions/winback-tools/src/index.js) — see the starter README.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

function normalizePositiveInteger(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return Math.floor(number);
}

function normalizeDaysSinceLastOrder(value) {
  return normalizePositiveInteger(value, 90);
}

function normalizePage(value) {
  return normalizePositiveInteger(value, DEFAULT_PAGE);
}

function normalizePageSize(value) {
  return Math.min(
    normalizePositiveInteger(value, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
}

function buildPayload(days, page, pageSize) {
  const lapsed = listLapsedCustomers(days);
  const count = lapsed.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const customers = lapsed.slice(start, start + pageSize).map((customer) => ({
    ...customer,
    daysSinceOrder: daysSince(customer.lastOrderedAt),
  }));

  return {
    days,
    count,
    page: currentPage,
    pageSize,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    customers,
  };
}

export const action = async ({ request }) => {
  const { cors } = await authenticate.admin(request);
  let days = 90;
  let page = DEFAULT_PAGE;
  let pageSize = DEFAULT_PAGE_SIZE;
  try {
    const body = await request.json();
    days = normalizeDaysSinceLastOrder(body?.daysSinceLastOrder);
    page = normalizePage(body?.page);
    pageSize = normalizePageSize(body?.pageSize);
  } catch {
    // no/invalid body — defaults apply
  }
  return cors(Response.json(buildPayload(days, page, pageSize)));
};
