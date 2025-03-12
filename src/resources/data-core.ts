import { DataCoreFetchCommand, type FlowcoreClient } from "@flowcore/sdk";
import type { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const dataCoreResource =
	(flowcoreClient: FlowcoreClient): ReadResourceTemplateCallback =>
	async (uri: URL, { dataCoreId }) => {
		const result = await flowcoreClient.execute(
			new DataCoreFetchCommand({
				dataCoreId: dataCoreId as string,
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
