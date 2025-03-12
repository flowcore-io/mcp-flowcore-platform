import { type FlowcoreClient, TenantListCommand } from "@flowcore/sdk";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const listTenantsHandler =
	(flowcoreClient: FlowcoreClient): ToolCallback => async () => {
		try {
			const result = await flowcoreClient.execute(new TenantListCommand());
			return {
				content: [
					{
						type: "text",
						uri: "tenant://list_tenants",
						text: JSON.stringify(
							result.map((tenant) => ({
								id: tenant.id,
								name: tenant.name,
								description: tenant.description,
								websiteUrl: tenant.websiteUrl,
								displayName: tenant.displayName,
							})),
						),
					},
				],
			};
		} catch (error) {
			return {
				isError: true,
				content: [
					{
						type: "text",
						text: JSON.stringify(`Failed to list tenants with error: ${error}`),
					},
				],
			};
		}
	};
