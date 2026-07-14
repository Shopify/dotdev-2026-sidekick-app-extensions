/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";

function customerIdsFromText(value = "") {
  return Array.from(
    new Set(
      String(value)
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
}

function stateFromCampaign(campaign) {
  return {
    name: campaign.name,
    subject: campaign.emailContent?.subject ?? "",
    previewText: campaign.emailContent?.previewText ?? "",
    body: campaign.emailContent?.body ?? "",
    customerIds: (campaign.customerIds ?? []).join("\n"),
  };
}

export default function CampaignForm({
  campaign,
  actionPath,
  heading,
  saveLabel = "Save",
  successMessage = "Campaign saved (demo)",
  enableDesignTool = false,
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const initialState = useMemo(() => stateFromCampaign(campaign), [campaign]);

  // BUILD 2 — WIRE THE ACTION (see prompts/04-compose-into-action.md)
  // TODO(Build 2): read the shopify.intents.request.value to get the campaign
  // name, status and customerIds (if available) to update the staged values
  const [staged, setStaged] = useState(initialState);
  const [baseline, setBaseline] = useState(initialState);

  const isSaving =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    setStaged(initialState);
    setBaseline(initialState);
  }, [initialState]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.ok) {
        if (fetcher.data.campaign) {
          const savedState = stateFromCampaign(fetcher.data.campaign);
          setStaged(savedState);
          setBaseline(savedState);
        }
        shopify.toast.show(successMessage);
        // BUILD 2 — WIRE THE ACTION (see prompts/04-compose-into-action.md)
        // TODO(Build 2): call to shopify.intents.response?.ok() to resolve the current intent (if any)
      } else {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.state, fetcher.data, navigate, shopify, successMessage]);

  useEffect(() => {
    if (!enableDesignTool) return undefined;

    // BUILD 2 — WIRE THE ACTION (see prompts/04-compose-into-action.md)
    // Register a `design_email` Sidekick tool so Sidekick can STAGE subject /
    // previewText / body changes into the controlled `staged` state below.
    // The merchant clicks Save — Sidekick never saves or sends silently.
    //
    // TODO(Build 2): implement the design_email registration below.
    //
    // const cleanup = shopify.tools.register("design_email", async (input) => {
    //   setStaged((prev) => ({ ...prev, ...input }));
    //   return { ok: true, note: "Staged in the form. Awaiting merchant Save." };
    // });
    // return () => cleanup?.();
    return undefined;
  }, [enableDesignTool, shopify]);

  // The "Send" button is intentionally INERT in this workshop app — there's no
  // real ESP wired up. It exists to make the merchant-in-the-loop send point
  // visible: Sidekick stages copy, the merchant reviews and Saves, and the
  // merchant is the one who sends. Sidekick never sends silently.
  const sendDemo = () =>
    shopify.toast.show("Sending is disabled in this workshop demo");

  const discard = (event) => {
    event.preventDefault();
    setStaged(baseline);
  };

  const set = (key) => (event) => {
    const value =
      event?.currentTarget?.value ??
      event?.target?.value ??
      event?.detail?.value;

    setStaged((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const audienceCount = customerIdsFromText(staged.customerIds).length;

  return (
    <s-page heading={heading}>
      <s-section heading="Campaign">
        <fetcher.Form
          id="campaign-form"
          method="post"
          action={actionPath}
          data-save-bar
          onReset={discard}
        >
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Name"
              name="name"
              value={staged.name}
              onInput={set("name")}
            />
            <s-text-field
              label="Subject"
              name="subject"
              value={staged.subject}
              onInput={set("subject")}
            />
            <s-text-field
              label="Preview text"
              name="previewText"
              value={staged.previewText}
              onInput={set("previewText")}
            />
            <s-text-area
              label="Body"
              name="body"
              value={staged.body}
              onInput={set("body")}
              rows={8}
            />
            <s-stack direction="inline" gap="base">
              <s-button type="submit" {...(isSaving ? { loading: true } : {})}>
                {saveLabel}
              </s-button>
              <s-button type="button" variant="primary" onClick={sendDemo}>
                Send
              </s-button>
              <s-badge tone={campaign.status === "DRAFT" ? "info" : "success"}>
                {campaign.status}
              </s-badge>
            </s-stack>
          </s-stack>
        </fetcher.Form>
      </s-section>
      <s-section heading="Customers">
        <s-paragraph>{audienceCount} customers</s-paragraph>
      </s-section>
    </s-page>
  );
}
