import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { listLapsedCustomers, listCustomers } from "../data/customers.server";
import { listCampaigns } from "../data/campaigns.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {
    totalCustomers: listCustomers().length,
    lapsedCount: listLapsedCustomers(90).length,
    campaignCount: listCampaigns().length,
  };
};

export default function Index() {
  const { totalCustomers, lapsedCount, campaignCount } = useLoaderData();

  return (
    <s-page heading="Win-back — email marketing (workshop app)">
      <s-section heading="What this app does">
        <s-paragraph>
          This is a demo email-marketing app for the DotDev Sidekick workshop. It
          can find <strong>lapsed customers</strong> (people who haven&apos;t
          ordered in a while) and draft <strong>win-back email campaigns</strong>{" "}
          to re-engage them.
        </s-paragraph>
        <s-paragraph>
          Your job in this workshop: design app extensions so that{" "}
          <strong>Sidekick</strong> can discover this capability, act on the data
          it returns, and chain a merchant&apos;s goal — &quot;win back customers
          who haven&apos;t ordered in 90 days&quot; — into a campaign the merchant
          reviews and sends.
        </s-paragraph>
      </s-section>

      <s-section heading="Demo data">
        <s-stack direction="block" gap="base">
          <s-text>Customers: {totalCustomers} customers</s-text>
          <s-text>Lapsed 90+ days: {lapsedCount} customers</s-text>
          <s-text>Campaigns: {campaignCount}</s-text>
        </s-stack>
        <s-paragraph>
          Data is served from the app backend (see <strong>app/data/</strong> and
          the <strong>/api/customers/lapsed</strong> route). It is synthetic — it
          is not your store&apos;s real customer data.
        </s-paragraph>
      </s-section>

      <s-section heading="Next">
        <s-paragraph>
          Follow the prompts in <strong>prompts/</strong>, starting with{" "}
          <strong>01-expose-data-extension.md</strong>.
        </s-paragraph>
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
