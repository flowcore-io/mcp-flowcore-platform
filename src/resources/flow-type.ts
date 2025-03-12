import { FlowTypeFetchCommand, type FlowcoreClient } from "@flowcore/sdk";
import type { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const flowTypeResource =
	(flowcoreClient: FlowcoreClient): ReadResourceTemplateCallback =>
	async (uri: URL, { flowTypeId }) => {
		const result = await flowcoreClient.execute(
			new FlowTypeFetchCommand({
				flowTypeId: flowTypeId as string,
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
