import { EventTypeListCommand, type FlowcoreClient } from "@flowcore/sdk";

export const listEventTypesHandler =
	(flowcoreClient: FlowcoreClient) =>
	async ({ flowTypeId }: { flowTypeId: string }) => {
		try {
			const result = await flowcoreClient.execute(
				new EventTypeListCommand({ flowTypeId }),
			);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							result.map((eventType) => ({
								id: eventType.id,
								name: eventType.name,
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
						`Failed to list event types with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
