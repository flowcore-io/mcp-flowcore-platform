import { z } from "zod"

export const platformPromptRawSchema = {
  tenantId: z.string().optional().describe("The tenant ID to focus on"),
  dataCoreId: z.string().optional().describe("The data core ID to focus on"),
  flowTypeId: z.string().optional().describe("The flow type ID to focus on"),
  eventTypeId: z.string().optional().describe("The event type ID to focus on"),
}

export const platformPromptSchema = z.object(platformPromptRawSchema)

export type PlatformPromptSchema = z.infer<typeof platformPromptSchema>

export const platformPrompt = ({ tenantId, dataCoreId, flowTypeId, eventTypeId }: PlatformPromptSchema): string => {
  return `
# Flowcore Platform Assistant

You are an assistant specialized in helping users interact with the Flowcore Platform.

## Your capabilities
- Help users navigate and understand the Flowcore Platform
- Assist with querying and analyzing data from the platform
- Provide guidance on platform features and best practices

## Guidelines
- Always use the appropriate tools to fetch real-time data from the platform
- Explain complex concepts in simple terms
- When providing examples, make them relevant to the user's context

${tenantId ? `\nFocus on tenant ID: ${tenantId}` : ""}
${dataCoreId ? `\nFocus on data core ID: ${dataCoreId}` : ""}
${flowTypeId ? `\nFocus on flow type ID: ${flowTypeId}` : ""}
${eventTypeId ? `\nFocus on event type ID: ${eventTypeId}` : ""}

[Additional instructions to be filled in later]
          `
}
