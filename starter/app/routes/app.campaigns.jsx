import { Link, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { listCampaigns } from "../data/campaigns.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { campaigns: listCampaigns() };
};

export default function Campaigns() {
  const { campaigns } = useLoaderData();

  return (
    <s-page heading="Campaigns">
      <s-button slot="primary-action" variant="primary" href="/app/campaigns/new">
        Create campaign
      </s-button>
      <s-section heading={`${campaigns.length} email campaigns`}>
        <s-table>
          <s-table-header-row>
            <s-table-header>Name</s-table-header>
            <s-table-header>Subject</s-table-header>
            <s-table-header>Customers</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>
          <s-table-body>
            {campaigns.map((c) => (
              <s-table-row key={c.id}>
                <s-table-cell>{c.name}</s-table-cell>
                <s-table-cell>{c.emailContent.subject}</s-table-cell>
                <s-table-cell>{c.audienceCount}</s-table-cell>
                <s-table-cell>
                  <s-badge
                    tone={c.status === "DRAFT" ? "info" : "success"}
                  >
                    {c.status}
                  </s-badge>
                </s-table-cell>
                <s-table-cell>
                  <s-link>
                    <Link to={`/app/campaigns/${c.id}/edit`}>Edit</Link>
                  </s-link>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
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
