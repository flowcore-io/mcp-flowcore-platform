import { FlowTypeListCommand, type FlowcoreClient } from "@flowcore/sdk";

export const listFlowTypesHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ dataCoreId }: { dataCoreId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new FlowTypeListCommand({ dataCoreId }),
			);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							result.map((flowType) => ({
								id: flowType.id,
								tenantId: flowType.tenantId,
								dataCoreId: flowType.dataCoreId,
								name: flowType.name,
								description: flowType.description,
								isDeleting: flowType.isDeleting,
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
						`Failed to list flow types with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
