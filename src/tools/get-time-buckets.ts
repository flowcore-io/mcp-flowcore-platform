import { type FlowcoreClient, TimeBucketListCommand, type TimeBucketListInput } from "@flowcore/sdk";

export const getTimeBucketsHandler =
	(flowcoreClient: FlowcoreClient) =>
	async (input: TimeBucketListInput) => {
		try {
			const result = await flowcoreClient.execute(
				new TimeBucketListCommand(input),
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
						`Failed to get time buckets with error: ${error}`,
					),
				},
			];

			return { isError: true, content };
		}
	};
