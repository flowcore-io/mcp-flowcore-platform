import { DataCoreCreateCommand, type DataCoreCreateInput, type FlowcoreClient } from "@flowcore/sdk"

export const createDataCoreHandler = (flowcoreClient: FlowcoreClient) => async (input: DataCoreCreateInput) => {
  try {
    const result = await flowcoreClient.execute(new DataCoreCreateCommand(input))

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
        text: JSON.stringify(`Failed to create data core with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
