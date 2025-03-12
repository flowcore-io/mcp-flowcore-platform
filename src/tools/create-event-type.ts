import { EventTypeCreateCommand, type EventTypeCreateInput, type FlowcoreClient } from "@flowcore/sdk"

export const createEventTypeHandler = (flowcoreClient: FlowcoreClient) => async (input: EventTypeCreateInput) => {
  try {
    const result = await flowcoreClient.execute(new EventTypeCreateCommand(input))

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
        text: JSON.stringify(`Failed to create event type with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
