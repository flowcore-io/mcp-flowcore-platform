import { FlowTypeCreateCommand, type FlowTypeCreateInput, type FlowcoreClient } from "@flowcore/sdk"

export const createFlowTypeHandler = (flowcoreClient: FlowcoreClient) => async (input: FlowTypeCreateInput) => {
  try {
    const result = await flowcoreClient.execute(new FlowTypeCreateCommand(input))

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
        text: JSON.stringify(`Failed to create flow type with error: ${error}`),
      },
    ]

    return { isError: true, content }
  }
}
