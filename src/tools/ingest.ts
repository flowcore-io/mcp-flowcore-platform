import { TenantFetchCommand, type FlowcoreClient } from "@flowcore/sdk"

export type IngestInput = {
  tenant: string
  dataCoreId: string
  flowTypeName: string
  eventTypeName: string
  events: string
}

export const ingestHandler = (apiKey: string, flowcoreClient: FlowcoreClient) => async ({
  tenant,
  dataCoreId,
  flowTypeName,
  eventTypeName,
  events,
}: IngestInput) => {

  try {
    const tenantConfig = await flowcoreClient.execute(new TenantFetchCommand({ tenant }))

    const ingestionBaseUrl = tenantConfig.isDedicated && tenantConfig.dedicated?.configuration.domain
      ? `https://webhook.${tenantConfig.dedicated?.configuration.domain}`
      : "https://webhook.api.flowcore.io"

    const webhookUrl = `${ingestionBaseUrl}/events/${tenant}/${dataCoreId}/${flowTypeName}/${eventTypeName}`

    // Execute the command manually since it's a custom command
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${apiKey}`,
      },
      body: events,
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result),
        },
      ],
    }
  } catch (error) {
    // Create properly typed content array for error
    const content = [
      {
        type: "text" as const,
        text: `Failed to ingest events with error: ${error}`,
      },
    ]

    return { isError: true, content }
  }
}
