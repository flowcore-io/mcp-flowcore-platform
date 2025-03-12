import { type FlowcoreClient, TenantFetchCommand } from "@flowcore/sdk";
import type { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const tenantResource =
	(flowcoreClient: FlowcoreClient): ReadResourceTemplateCallback =>
	async (uri: URL, { tenantId }) => {
		const result = await flowcoreClient.execute(
			new TenantFetchCommand({
				tenantId: tenantId as string,
			}),
		);
		return {
			contents: [
				{
					uri: uri.href,
					text: JSON.stringify(result),
				},
			],
		};
	};
