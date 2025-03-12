import { EventTypeRequestDeleteCommand, type EventTypeRequestDeleteInput, type FlowcoreClient } from "@flowcore/sdk"

export const requestDeleteEventTypeHandler =
  (flowcoreClient: FlowcoreClient) => async (input: EventTypeRequestDeleteInput) => {
    try {
      const result = await flowcoreClient.execute(new EventTypeRequestDeleteCommand(input))

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
          text: JSON.stringify(`Failed to request delete event type with error: ${error}`),
        },
      ]

      return { isError: true, content }
    }
  }
