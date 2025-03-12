import { DataCoreRequestDeleteCommand, type DataCoreRequestDeleteInput, type FlowcoreClient } from "@flowcore/sdk"

export const requestDeleteDataCoreHandler =
  (flowcoreClient: FlowcoreClient) => async (input: DataCoreRequestDeleteInput) => {
    try {
      const result = await flowcoreClient.execute(new DataCoreRequestDeleteCommand(input))

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
          text: JSON.stringify(`Failed to request delete data core with error: ${error}`),
        },
      ]

      return { isError: true, content }
    }
  }
