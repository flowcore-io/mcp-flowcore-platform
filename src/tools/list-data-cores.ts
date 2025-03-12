import { DataCoreListCommand, type FlowcoreClient } from "@flowcore/sdk";

export const listDataCoresHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ tenantId }: { tenantId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new DataCoreListCommand({ tenantId }),
			);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							result.map((dataCore) => ({
								id: dataCore.id,
								name: dataCore.name,
							})),
						),
					},
				],
			};
		} catch (error) {
			// Create properly typed content array for error
			const content = [
				{
					type: "text" as const,
					text: JSON.stringify(
						`Failed to list data cores with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
