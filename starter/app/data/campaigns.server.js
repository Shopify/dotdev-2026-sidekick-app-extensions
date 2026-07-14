import { readFileSync } from "node:fs";

const seed = JSON.parse(
  readFileSync(new URL("../../shared/campaigns.json", import.meta.url), "utf8"),
);
const seedSignature = JSON.stringify(seed);

/**
 * Email campaigns live in an in-memory store seeded from shared/campaigns.json.
 * This is deliberately simple (no database) so the workshop stays focused on
 * the Sidekick extension surface, not app plumbing. Bring your own persistence
 * if you adapt this to a real app.
 */
function normalizeCustomerIds(customerIds = []) {
  const values = Array.isArray(customerIds)
    ? customerIds
    : String(customerIds)
        .split(/[\s,]+/)
        .filter(Boolean);

  return Array.from(
    new Set(
      values
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
}

function normalizeEmailContent(campaignOrPatch = {}) {
  return {
    subject: String(
      campaignOrPatch.emailContent?.subject ?? campaignOrPatch.subject ?? "",
    ),
    previewText: String(
      campaignOrPatch.emailContent?.previewText ??
        campaignOrPatch.previewText ??
        "",
    ),
    body: String(campaignOrPatch.emailContent?.body ?? campaignOrPatch.body ?? ""),
  };
}

function serializeCampaign(campaign) {
  const customerIds = normalizeCustomerIds(campaign.customerIds);
  return {
    id: campaign.id,
    name: campaign.name,
    emailContent: normalizeEmailContent(campaign),
    status: campaign.status,
    customerIds,
    audienceCount: customerIds.length,
    createdAt: campaign.createdAt,
  };
}

function getStore() {
  if (
    !globalThis.__campaignStore ||
    globalThis.__campaignStoreSeedSignature !== seedSignature
  ) {
    globalThis.__campaignStore = new Map(
      seed.map((campaign) => [
        campaign.id,
        {
          ...campaign,
          emailContent: normalizeEmailContent(campaign),
          customerIds: normalizeCustomerIds(campaign.customerIds),
        },
      ]),
    );
    globalThis.__campaignStoreSeedSignature = seedSignature;
  }
  return globalThis.__campaignStore;
}

export function getCampaign(id) {
  const campaign = getStore().get(id);
  return campaign ? serializeCampaign(campaign) : undefined;
}

export function listCampaigns() {
  return Array.from(getStore().values())
    .map(serializeCampaign)
    .sort((a, b) => b.id - a.id);
}

export function updateCampaign(id, patch) {
  const store = getStore();
  const current = store.get(id);
  if (!current) return undefined;
  const next = {
    ...current,
    ...patch,
    emailContent:
      "emailContent" in patch ||
      "subject" in patch ||
      "previewText" in patch ||
      "body" in patch
        ? normalizeEmailContent({ ...current.emailContent, ...patch })
        : current.emailContent,
    customerIds:
      "customerIds" in patch
        ? normalizeCustomerIds(patch.customerIds)
        : current.customerIds,
  };
  store.set(id, next);
  return serializeCampaign(next);
}

export function createCampaign(patch) {
  const store = getStore();
  const nextId = Math.max(...store.keys()) + 1;
  const campaign = {
    id: nextId,
    name: patch.name,
    emailContent: normalizeEmailContent(patch),
    status: "DRAFT",
    customerIds: normalizeCustomerIds(patch.customerIds),
    createdAt: new Date().toISOString(),
  };
  store.set(nextId, campaign);
  return serializeCampaign(campaign);
}

