import { EventTypeUpdateCommand, type EventTypeUpdateInput, type FlowcoreClient } from "@flowcore/sdk"

export const updateEventTypeHandler = (flowcoreClient: FlowcoreClient) => async (input: EventTypeUpdateInput) => {
  try {
    const result = await flowcoreClient.execute(new EventTypeUpdateCommand(input))

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
        text: JSON.stringify(`Failed to update event type with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
