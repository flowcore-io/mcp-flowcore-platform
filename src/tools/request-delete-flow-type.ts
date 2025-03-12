import { FlowTypeRequestDeleteCommand, type FlowTypeRequestDeleteInput, type FlowcoreClient } from "@flowcore/sdk"

export const requestDeleteFlowTypeHandler =
  (flowcoreClient: FlowcoreClient) => async (input: FlowTypeRequestDeleteInput) => {
    try {
      const result = await flowcoreClient.execute(new FlowTypeRequestDeleteCommand(input))

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
          text: JSON.stringify(`Failed to request delete flow type with error: ${error}`),
        },
      ]

      return { isError: true, content }
    }
  }
