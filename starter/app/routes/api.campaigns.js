import { authenticate } from "../shopify.server";
import { listCampaigns } from "../data/campaigns.server";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function normalizeLimit(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(number), MAX_LIMIT);
}

export const action = async ({ request }) => {
  const { cors } = await authenticate.admin(request);
  let status;
  let limit = DEFAULT_LIMIT;

  try {
    const body = await request.json();
    status = typeof body?.status === "string" ? body.status : undefined;
    limit = normalizeLimit(body?.limit);
  } catch {
    // no/invalid body — defaults apply
  }

  const campaigns = listCampaigns()
    .filter((campaign) => !status || campaign.status === status)
    .slice(0, limit);

  return cors(Response.json({ campaigns }));
};
