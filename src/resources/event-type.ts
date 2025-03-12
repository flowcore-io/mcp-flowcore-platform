import { EventTypeFetchCommand, type FlowcoreClient } from "@flowcore/sdk";
import type { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const eventTypeResource =
	(flowcoreClient: FlowcoreClient): ReadResourceTemplateCallback =>
	async (uri: URL, { eventTypeId }) => {
		const result = await flowcoreClient.execute(
			new EventTypeFetchCommand({
				eventTypeId: eventTypeId as string,
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
