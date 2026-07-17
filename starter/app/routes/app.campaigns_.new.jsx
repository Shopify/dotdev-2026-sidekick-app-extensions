import { useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import CampaignForm from "../components/CampaignForm";
import { authenticate } from "../shopify.server";
import { createCampaign } from "../data/campaigns.server";

const blankCampaign = {
  id: "new",
  name: "",
  emailContent: {
    subject: "",
    previewText: "",
    body: "",
  },
  status: "DRAFT",
  customerIds: [],
};

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { campaign: blankCampaign };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const form = await request.formData();
  const campaign = createCampaign({
    name: String(form.get("name") ?? ""),
    emailContent: {
      subject: String(form.get("subject") ?? ""),
      previewText: String(form.get("previewText") ?? ""),
      body: String(form.get("body") ?? ""),
    },
    customerIds: String(form.get("customerIds") ?? ""),
  });

  return {
    ok: true,
    campaign,
    redirectTo: `/app/campaigns/${campaign.id}/edit`,
  };
};

export default function NewCampaign() {
  const { campaign } = useLoaderData();

  return (
    <CampaignForm
      campaign={campaign}
      actionPath="/app/campaigns/new"
      heading="Create campaign"
      saveLabel="Create"
      successMessage="Campaign created (demo)"
    />
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
