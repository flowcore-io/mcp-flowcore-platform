import { TenantFetchCommand, type FlowcoreClient } from "@flowcore/sdk";

export const getTenantHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ tenantId }: { tenantId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new TenantFetchCommand({ tenantId }),
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
					text: JSON.stringify(`Failed to get tenant with error: ${error}`),
				},
			];

			return { isError: true, content };
		}
	};
