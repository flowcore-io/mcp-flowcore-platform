import { FlowTypeUpdateCommand, type FlowTypeUpdateInput, type FlowcoreClient } from "@flowcore/sdk"

export const updateFlowTypeHandler = (flowcoreClient: FlowcoreClient) => async (input: FlowTypeUpdateInput) => {
  try {
    const result = await flowcoreClient.execute(new FlowTypeUpdateCommand(input))

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
        text: JSON.stringify(`Failed to update flow type with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
