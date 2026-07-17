import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/index.js' {
  interface FindLapsedCustomersInput {
    /**
     * Optional minimum number of days since the customer's last order. Defaults to 90.
     */
    daysSinceLastOrder?: number;
    /**
     * Optional 1-based page number to return. Defaults to 1.
     */
    page?: number;
    /**
     * Optional number of customers per page. Defaults to 25 and is capped at 50.
     */
    pageSize?: number;
    [k: string]: unknown;
  }

  interface FindLapsedCustomersOutput {
    /**
     * The days-since-last-order threshold used.
     */
    days?: number;
    /**
     * The total number of lapsed customers found across all pages.
     */
    count?: number;
    /**
     * The returned 1-based page number.
     */
    page?: number;
    /**
     * The number of customers requested per page.
     */
    pageSize?: number;
    /**
     * The total number of pages available.
     */
    totalPages?: number;
    /**
     * Whether another page is available after this one.
     */
    hasNextPage?: boolean;
    /**
     * Whether another page is available before this one.
     */
    hasPreviousPage?: boolean;
    /**
     * The lapsed customers for the returned page.
     */
    customers?: {
      id?: number;
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      ordersCount?: number;
      totalSpent?: number;
      createdAt?: string;
      lastOrderedAt?: string;
      daysSinceOrder?: number;
      notes?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }

  interface FindCampaignsInput {
    /**
     * Optional campaign status filter.
     */
    status?: string;
    /**
     * Optional maximum number of campaigns to return. Defaults to 10 and is capped at 25.
     */
    limit?: number;
    [k: string]: unknown;
  }

  interface FindCampaignsOutput {
    /**
     * Existing campaigns returned as resource links.
     */
    results?: {
      /**
       * Always resource_link.
       */
      type?: string;
      /**
       * Stable campaign URI: gid://application/campaign/<campaignId>.
       */
      uri?: string;
      /**
       * Human-readable campaign name.
       */
      name?: string;
      /**
       * Always application/campaign.
       */
      mimeType?: string;
      /**
       * Compact campaign metadata.
       */
      _meta?: {
        id?: string;
        status?: string;
        customerIds?: number[];
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }

  interface ShopifyTools {
    /**
     * Find customers who have not placed an order in a given number of days. Results are paginated.
     */
    register(
      name: 'find_lapsed_customers',
      handler: (
        input: FindLapsedCustomersInput,
      ) => FindLapsedCustomersOutput | Promise<FindLapsedCustomersOutput>,
    ): () => void;
    /**
     * Find existing campaigns that can be opened for editing.
     */
    register(
      name: 'find_campaigns',
      handler: (
        input: FindCampaignsInput,
      ) => FindCampaignsOutput | Promise<FindCampaignsOutput>,
    ): () => void;
  }

  const shopify: import('@shopify/ui-extensions/admin').WithGeneratedTools<
    import('@shopify/ui-extensions/admin.app.tools.data').Api,
    ShopifyTools
  >;
  const globalThis: { shopify: typeof shopify };
}
