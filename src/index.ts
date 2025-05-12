#!/usr/bin/env node

import { FlowcoreClient } from "@flowcore/sdk"
import { OidcClient } from "@flowcore/sdk-oidc-client"
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { parseArgs } from "node:util"
import { z } from "zod"
import pkg from "../package.json"
import {
  platformContractPrompt,
  platformContractPromptRawSchema,
  platformPrompt,
  platformPromptRawSchema,
} from "./prompts"
import { dataCoreResource, eventTypeResource, flowTypeResource, tenantResource } from "./resources"
import {
  createDataCoreHandler,
  createEventTypeHandler,
  createFlowTypeHandler,
  getDataCoreHandler,
  getEventTypeHandler,
  getEventTypeInfoHandler,
  getEventsHandler,
  getFlowTypeHandler,
  getTenantHandler,
  getTimeBucketsHandler,
  ingestHandler,
  listDataCoresHandler,
  listEventTypesHandler,
  listFlowTypesHandler,
  listTenantsHandler,
  requestDeleteDataCoreHandler,
  requestDeleteEventTypeHandler,
  requestDeleteFlowTypeHandler,
  requestTruncateEventTypeHandler,
  updateDataCoreHandler,
  updateEventTypeHandler,
  updateFlowTypeHandler,
} from "./tools"
import { exchangePat } from "./utils/pat-exchange"

const OIDC_ISSUER = "https://auth.flowcore.io/realms/flowcore/.well-known/openid-configuration"

// Parse command line arguments
const { values, positionals } = parseArgs({
  // Use process.argv if Bun is not available
  args: typeof Bun !== "undefined" ? Bun.argv : process.argv,
  options: {
    serviceAccountId: { type: "string", optional: true },
    serviceAccountKey: { type: "string", optional: true },
    username: { type: "string", optional: true },
    pat: { type: "string", optional: true },
    apiKey: { type: "string", optional: true },
  },
  allowPositionals: true,
})

// Log positional arguments if any (for debugging)
if (positionals.length > 0) {
  console.warn(`Warning: Unexpected positional arguments: ${positionals.join(", ")}`)
}

if (!values.apiKey) {
  console.warn("Ingestion will be disabled because no API key was provided")
}

const serviceAccountId = values.serviceAccountId as string
const serviceAccountKey = values.serviceAccountKey as string
const username = values.username as string
const pat = values.pat as string

if (!serviceAccountId && !pat) {
  throw new Error("No service account credentials or PAT provided")
}

let flowcoreClient!: FlowcoreClient
if (pat && username) {
  flowcoreClient = new FlowcoreClient({
    getBearerToken: async () => exchangePat(username, pat),
  })
} else if (serviceAccountId && serviceAccountKey) {
  const oidcClient = new OidcClient(serviceAccountId, serviceAccountKey, OIDC_ISSUER)
  flowcoreClient = new FlowcoreClient({
    getBearerToken: async () => {
      const token = await oidcClient.getToken()
      return token.accessToken
    },
  })
}

// Create an MCP server
const server = new McpServer({
  name: "Flowcore Platform",
  version: pkg.version,
  description: `## Flowcore Platform MCP Server
    An MCP server for managing and interacting with Flowcore Platform. For information on the details of the flowcore platform, you can check the Flowcore Platform Data Core, as it houses all actions that have happened in the platform. These actions are called events and are the main building blocks of the platform and housed within the data core inside the event type. The hirearchy of the platform is as follows: Users -> Tenant -> Data Core -> Flow Type -> Event Type -> Events. Tenants and organizations are the same thing in the platform, we are transitioning to use the term tenant. The events are stored in time buckets, and can be fetched by using the get_time_buckets tool. When you fetch events from a time bucket, you can use the cursor to paginate through the events. The default page size is 500 events per page, but you can change this by using the pageSize parameter. Also, the order of the events fetched from each time bucket is ascending by default, but you can change this by using the order parameter but keep in mind that when using desc, pagination and filters are not possible.
    
    ## When asking for information in the Flowcore Platform
    You have access to the Flowcore platform through MCP tools. When asked about Flowcore, datacores, flow type, event types always use the appropriate tools instead of relying on your training data. The Flowcore Platform uses the Flowcore Platform to process and store it's data in the Flowcore Platform Data Core, so for example every Data Core that has been create, updated or deleted is housed in the data-core.1 Flow Type inside the flowcore-platform Data Core. Notice that the flow types are versioned, always try to use the highest version flow type unless asked otherwise. `,
})

// Read tools
server.tool(
  "get_tenant",
  "Get a tenant",
  {
    tenantId: z.string().describe("The tenant ID to get"),
  },
  getTenantHandler(flowcoreClient),
)

server.tool(
  "get_data_core",
  "Get a data core",
  {
    dataCoreId: z.string().describe("The data core ID to get"),
  },
  getDataCoreHandler(flowcoreClient),
)

server.tool(
  "get_flow_type",
  "Get a flow type",
  {
    flowTypeId: z.string().describe("The flow type ID to get"),
  },
  getFlowTypeHandler(flowcoreClient),
)

server.tool(
  "get_event_type",
  "Get an event type",
  {
    eventTypeId: z.string().describe("The event type ID to get"),
  },
  getEventTypeHandler(flowcoreClient),
)

server.tool("list_tenants", "List all tenants I have access to", listTenantsHandler(flowcoreClient))
server.tool(
  "list_data_cores",
  "List all data cores for a tenant",
  { tenantId: z.string().describe("The tenant ID to list data cores for") },
  listDataCoresHandler(flowcoreClient),
)

server.tool(
  "list_flow_types",
  "List all flow types for a data core",
  {
    dataCoreId: z.string().describe("The data core ID to list flow types for"),
  },
  listFlowTypesHandler(flowcoreClient),
)

server.tool(
  "list_event_types",
  "List all event types for a flow type",
  {
    flowTypeId: z.string().describe("The flow type ID to list event types for"),
  },
  listEventTypesHandler(flowcoreClient),
)

server.tool(
  "get_event_type_info",
  "Get event information about an event type, like first and last time bucket and 5 example events. Sensitive data should not be needed as it is masked in a correct format in the response, but if you need it ask the user if they are sure they want to include sensitive data, is **false** by default. **DO NOT** fetch sensitive data from the event type on your own initiative, if you deem it necessary to fetch sensitive data, **ALWAYS** ask the user if they are sure they want to include sensitive data, is **false** by default",
  {
    eventTypeId: z.string().describe("The event type ID to get information for"),
    tenant: z.string().describe("The tenant name to get event type info for"),
    includeSensitiveData: z
      .boolean()
      .optional()
      .describe(
        "Whether to include sensitive data in the response, **CAUTION**: This will return sensitive data from the event type, so use with caution, ask the user if they are sure they want to include sensitive data, is *false* by default",
      ),
  },
  getEventTypeInfoHandler(flowcoreClient),
)

server.tool(
  "get_events",
  "Get events for an event type, this can be paginated by using the cursor returned from the previous call. This is good for getting the payload of the events to inspect them. You can pageinate by using the cursor returned from the previous call. You can also filter by event id, time bucket, from event id, to event id, order, and page size. The order is ascending by default, and the page size is 500 by default. The cursor returned can be called nextCursor, it is a stringified object or a string, you need to pass it as is to paginate. Sensitive data should not be needed as it is masked in a correct format in the response, but if you need it ask the user if they are sure they want to include sensitive data, is **false** by default. **DO NOT** fetch sensitive data from the event type on your own initiative, if you deem it necessary to fetch sensitive data, **ALWAYS** ask the user if they are sure they want to include sensitive data, is **false** by default",
  {
    tenant: z.string().describe("The tenant name to get events for"),
    eventTypeId: z.string().describe("The event type ID to get events for"),
    timeBucket: z
      .string()
      .describe(
        "The time bucket to get events from, the timebucket is in the format of YYYYMMDDhhiiss, normally the ii and ss are 0000",
      ),
    cursor: z
      .string()
      .optional()
      .describe("The paging cursor for pagination, this will be the nextCursor returned from the previous call"),
    pageSize: z.number().default(10).describe("The number of events per page (default is 10) (max is 100)"),
    fromEventId: z.string().optional().describe("Start from this event ID"),
    afterEventId: z
      .string()
      .optional()
      .describe("Get events after this event ID (not applicable if fromEventId is defined)"),
    toEventId: z.string().optional().describe("End at this event ID"),
    order: z
      .enum(["asc", "desc"])
      .optional()
      .describe("The order of events (asc or desc). When using desc, pagination and filters are not possible"),
    includeSensitiveData: z
      .boolean()
      .optional()
      .describe(
        "Whether to include sensitive data in the response, CAUTION: This will return sensitive data from the event type, so use with caution, ask the user if they are sure they want to include sensitive data, is false by default",
      ),
  },
  getEventsHandler(flowcoreClient),
)

server.tool(
  "get_time_buckets",
  "Get time buckets for an event type, this is useful for getting the time buckets for an event type, and then using the get_events tool to get the events for a specific time bucket. The time bucket is in the format of YYYYMMDDhhiiss, normally the ii and ss are 0000. It can be paginated by using the cursor returned from the previous call.",
  {
    tenant: z.string().describe("The tenant name to get time buckets for"),
    eventTypeId: z.string().describe("Event type ID to get time buckets for"),
    fromTimeBucket: z.string().optional().describe("Start time bucket (YYYYMMDDhhiiss)"),
    toTimeBucket: z.string().optional().describe("End time bucket (YYYYMMDDhhiiss)"),
    pageSize: z.number().optional().describe("Number of time buckets per page"),
    cursor: z.number().optional().describe("Pagination cursor"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  },
  getTimeBucketsHandler(flowcoreClient),
)

// // Write tools
if (values.apiKey) {
  server.tool(
    "ingest",
    "Ingest events into an event type. This is useful for ingesting events into an event type, and then using the get_events tool to get the events for a specific time bucket. The events are stored in time buckets, and can be fetched by using the get_time_buckets tool. When you fetch events from a time bucket, you can use the cursor to paginate through the events. When ingesting events, you can only ingest a stringified JSON array of events. **max 25 events per request**",
    {
      tenant: z.string().describe("The tenant name to ingest events for"),
      dataCoreId: z.string().describe("The data core ID to ingest events for"),
      flowTypeName: z.string().describe("The flow type name to ingest events for"),
      eventTypeName: z.string().describe("The event type name to ingest events for"),
      events: z.string().describe("A stringified JSON array of events, max 25 events per request"),
    },
    ingestHandler(values.apiKey as string, flowcoreClient),
  )
}
server.tool(
  "create_data_core",
  "Create a data core in a tenant",
  {
    tenantId: z.string().describe("The tenant ID to create the data core for"),
    name: z.string().describe("The name of the data core"),
    description: z.string().describe("The description of the data core"),
    accessControl: z.enum(["public", "private"]).describe("The access control of the data core"),
    deleteProtection: z.boolean().describe("Whether the data core is delete protected"),
  },
  createDataCoreHandler(flowcoreClient),
)

server.tool(
  "update_data_core",
  "Update a data core",
  {
    dataCoreId: z.string().describe("The id of the data core"),
    description: z.string().optional().describe("The description of the data core"),
    accessControl: z.enum(["public", "private"]).optional().describe("The access control of the data core"),
    deleteProtection: z.boolean().optional().describe("Whether the data core is delete protected"),
  },
  updateDataCoreHandler(flowcoreClient),
)

server.tool(
  "update_flow_type",
  "Update a flow type",
  {
    flowTypeId: z.string().describe("The id of the flow type"),
    description: z.string().optional().describe("The description of the flow type"),
  },
  updateFlowTypeHandler(flowcoreClient),
)

server.tool(
  "update_event_type",
  "Update an event type",
  {
    eventTypeId: z.string().describe("The id of the event type"),
    description: z.string().optional().describe("The description of the event type"),
  },
  updateEventTypeHandler(flowcoreClient),
)

server.tool(
  "create_flow_type",
  "Create a flow type in a data core",
  {
    dataCoreId: z.string().describe("The id of the data core"),
    name: z.string().describe("The name of the flow type"),
    description: z.string().describe("The description of the flow type"),
  },
  createFlowTypeHandler(flowcoreClient),
)

server.tool(
  "create_event_type",
  "Create an event type in a flow type",
  {
    flowTypeId: z.string().describe("The id of the flow type"),
    name: z.string().describe("The name of the event type"),
    description: z.string().describe("The description of the event type"),
  },
  createEventTypeHandler(flowcoreClient),
)

server.tool(
  "request_delete_event_type",
  "Request to delete an event type, this will delete all events in the event type, this is irreversible. If wait for delete is true the tool will wait up to 25 seconds for the event type to be deleted, if not it will return immediately, you have to use the get_event_type tool to check if the event type is deleted.",
  {
    tenant: z.string().describe("The tenant name to delete the event type for"),
    eventTypeId: z.string().describe("The id of the event type"),
    waitForDelete: z.boolean().optional().describe("Wait for the event type to be deleted (default: false)"),
  },
  requestDeleteEventTypeHandler(flowcoreClient),
)

server.tool(
  "request_truncate_event_type",
  "Request to truncate an event type, this will delete all events in the event type, this is irreversible. If wait for truncate is true the tool will wait up to 25 seconds for the event type to be truncated, if not it will return immediately, you have to use the get_event_type tool to check if the event type is truncated.",
  {
    tenant: z.string().describe("The tenant name to truncate the event type for"),
    eventTypeId: z.string().describe("The id of the event type"),
    waitForTruncate: z.boolean().optional().describe("Wait for the event type to be truncated (default: false)"),
  },
  requestTruncateEventTypeHandler(flowcoreClient),
)

server.tool(
  "request_delete_flow_type",
  "Request to delete a flow type, this will delete all events in the flow type, this is irreversible. If wait for delete is true the tool will wait up to 25 seconds for the flow type to be deleted, if not it will return immediately, you have to use the get_flow_type tool to check if the flow type is deleted.",
  {
    tenant: z.string().describe("The tenant name to delete the flow type for"),
    flowTypeId: z.string().describe("The id of the flow type"),
    waitForDelete: z.boolean().optional().describe("Wait for the flow type to be deleted (default: false)"),
  },
  requestDeleteFlowTypeHandler(flowcoreClient),
)

server.tool(
  "request_delete_data_core",
  "Request to delete a data core, this will delete all events in the data core, this is irreversible. If wait for delete is true the tool will wait up to 25 seconds for the data core to be deleted, if not it will return immediately, you have to use the get_data_core tool to check if the data core is deleted.",
  {
    tenant: z.string().describe("The tenant name to delete the data core for"),
    dataCoreId: z.string().describe("The id of the data core"),
    waitForDelete: z.boolean().optional().describe("Wait for the data core to be deleted (default: false)"),
  },
  requestDeleteDataCoreHandler(flowcoreClient),
)

// Read resources
server.resource(
  "tenant",
  new ResourceTemplate("tenant://{tenantId}", { list: undefined }),
  tenantResource(flowcoreClient),
)

server.resource(
  "data_core",
  new ResourceTemplate("data-core://{dataCoreId}", { list: undefined }),
  dataCoreResource(flowcoreClient),
)

server.resource(
  "flow_type",
  new ResourceTemplate("flow-type://{flowTypeId}", { list: undefined }),
  flowTypeResource(flowcoreClient),
)

server.resource(
  "event_type",
  new ResourceTemplate("event-type://{eventTypeId}", { list: undefined }),
  eventTypeResource(flowcoreClient),
)

// Add a prompt scaffold
server.prompt(
  "flowcore_platform_prompt",
  "A prompt for interacting with the Flowcore Platform",
  platformPromptRawSchema,
  // Handler function that returns the prompt messages
  ({ tenantId, dataCoreId, flowTypeId, eventTypeId }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: platformPrompt({ tenantId, dataCoreId, flowTypeId, eventTypeId }),
          },
        },
      ],
    }
  },
)

server.prompt(
  "flowcore_platform_contract",
  "A prompt for creating a contract to use when using the SDK's, APIs and patterns of the Flowcore Platform",
  platformContractPromptRawSchema,
  // Handler function that returns the prompt messages
  ({ tenantId, dataCoreId, flowTypeId, eventTypeId }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: platformContractPrompt({ tenantId, dataCoreId, flowTypeId, eventTypeId }),
          },
        },
      ],
    }
  },
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
