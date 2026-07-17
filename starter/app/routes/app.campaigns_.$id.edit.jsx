import { useLoaderData, useParams, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import CampaignForm from "../components/CampaignForm";
import { authenticate } from "../shopify.server";
import { getCampaign, updateCampaign } from "../data/campaigns.server";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const id = Number(params.id);
  const campaign = getCampaign(id);
  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }
  return { campaign };
};

export const action = async ({ request, params }) => {
  await authenticate.admin(request);
  const id = Number(params.id);
  const form = await request.formData();
  const next = updateCampaign(id, {
    name: String(form.get("name") ?? ""),
    emailContent: {
      subject: String(form.get("subject") ?? ""),
      previewText: String(form.get("previewText") ?? ""),
      body: String(form.get("body") ?? ""),
    },
    customerIds: String(form.get("customerIds") ?? ""),
  });
  if (!next) return { ok: false, error: "Campaign not found" };
  return { ok: true, campaign: next };
};

export default function EditCampaign() {
  const { id } = useParams();
  const { campaign } = useLoaderData();

  return (
    <CampaignForm
      campaign={campaign}
      actionPath={`/app/campaigns/${id}/edit`}
      heading={`Edit: ${campaign.name}`}
      successMessage="Campaign saved (demo)"
    />
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
