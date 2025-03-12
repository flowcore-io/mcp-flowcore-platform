import { DataCoreFetchCommand, type FlowcoreClient } from "@flowcore/sdk";

export const getDataCoreHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ dataCoreId }: { dataCoreId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new DataCoreFetchCommand({ dataCoreId }),
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
						`Failed to get data core with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
