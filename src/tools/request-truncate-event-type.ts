import { EventTypeRequestTruncateCommand, type EventTypeRequestTruncateInput, type FlowcoreClient } from "@flowcore/sdk"

export const requestTruncateEventTypeHandler =
  (flowcoreClient: FlowcoreClient) => async (input: EventTypeRequestTruncateInput) => {
    try {
      const result = await flowcoreClient.execute(new EventTypeRequestTruncateCommand(input))

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
          text: JSON.stringify(`Failed to request truncate event type with error: ${error}`),
        },
      ]

      return { isError: true, content }
    }
  }
