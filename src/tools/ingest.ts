export type IngestInput = {
  tenant: string
  dataCoreId: string
  flowTypeName: string
  eventTypeName: string
  events: unknown[] | unknown
}

export const ingestHandler = (apiKey: string) => async ({
  tenant,
  dataCoreId,
  flowTypeName,
  eventTypeName,
  events,
}: IngestInput) => {
  try {
    let type = "event"

    if (Array.isArray(events)) {
      type = "events"
    }

    const webhookUrl = `https://webhook.api.flowcore.io/${type}/${tenant}/${dataCoreId}/${flowTypeName}/${eventTypeName}`

    // Execute the command manually since it's a custom command
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${apiKey}`,
      },
      body: JSON.stringify(events),
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
