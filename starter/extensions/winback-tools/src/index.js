
export default async function extension() {
  shopify.tools.register("find_lapsed_customers", async (input) => {
    const response = await fetch("/api/customers/lapsed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input ?? {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to load lapsed customers: ${response.status}`);
    }

    return response.json();
  });

  shopify.tools.register(
    "find_campaigns",
    async ({ status, limit = 10 } = {}) => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, limit }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load campaigns: ${response.status}`);
      }

      const { campaigns } = await response.json();

      return {
        results: campaigns.map((/** @type {{ id: String; name: String; status: String; customerIds: String[]; }} */ campaign) => ({
          type: "resource_link",
          uri: `gid://application/campaign/${campaign.id}`,
          name: campaign.name,
          mimeType: "application/campaign",
          _meta: {
            id: String(campaign.id),
            status: campaign.status,
            customerIds: campaign.customerIds,
          },
        })),
      };
    },
  );
}
