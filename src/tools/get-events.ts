import { EventListCommand, type EventListInput, type FlowcoreClient } from "@flowcore/sdk"

export const getEventsHandler = (flowcoreClient: FlowcoreClient) => async (input: EventListInput) => {
  try {
    if (input.pageSize && input.pageSize > 100) {
      input.pageSize = 100
    }

    const result = await flowcoreClient.execute(new EventListCommand(input))

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
        text: JSON.stringify(`Failed to get events with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
