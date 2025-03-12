import { DataCoreUpdateCommand, type DataCoreUpdateInput, type FlowcoreClient } from "@flowcore/sdk"

export const updateDataCoreHandler = (flowcoreClient: FlowcoreClient) => async (input: DataCoreUpdateInput) => {
  try {
    const result = await flowcoreClient.execute(new DataCoreUpdateCommand(input))

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
        text: JSON.stringify(`Failed to update data core with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
