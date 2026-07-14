// ─────────────────────────────────────────────────────────────────────────────
// Admin app data extension (target: admin.app.tools.data)
//
// This is the scaffold you'd get from:
//   shopify app generate extension --template app_data --name winback-tools
//
// Tools run CLIENT-SIDE in Shopify's sandbox, must return JSON, and must come
// back in under ~1 second. They're how Sidekick queries your app's data.
//
// It ships with a placeholder tool. In BUILD 1 (Step 1) you'll replace it with
// `find_lapsed_customers`, wired to this app's /api/audiences/lapsed endpoint.
// See prompts/01-expose-data-extension.md.
// ─────────────────────────────────────────────────────────────────────────────

export default async function extension() {
  shopify.tools.register("placeholder", async () => {
    // TODO(Build 1): replace with find_lapsed_customers.
    return { note: "Replace me — see prompts/01-expose-data-extension.md" };
  });
}
