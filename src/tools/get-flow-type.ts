import { FlowTypeFetchCommand, type FlowcoreClient } from "@flowcore/sdk";

export const getFlowTypeHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ flowTypeId }: { flowTypeId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new FlowTypeFetchCommand({ flowTypeId }),
			);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(result),
					},
				],
			};
		} catch (error) {
			// Create properly typed content array for error
			const content = [
				{
					type: "text" as const,
					text: JSON.stringify(
						`Failed to get flow type with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
