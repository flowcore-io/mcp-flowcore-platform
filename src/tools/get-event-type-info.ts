import { EventTypeInfoCommand, type FlowcoreClient } from "@flowcore/sdk";

export const getEventTypeInfoHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ eventTypeId }: { eventTypeId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new EventTypeInfoCommand({ eventTypeId }),
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
						`Failed to get event type info with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
