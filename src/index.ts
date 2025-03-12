import { FlowcoreClient } from "@flowcore/sdk"
import { OidcClient } from "@flowcore/sdk-oidc-client"
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { parseArgs } from "node:util"
import { z } from "zod"
// Import package.json for version
import pkg from "../package.json"
import { dataCoreResource, eventTypeResource, flowTypeResource, tenantResource } from "./resources"
import {
  getEventTypeInfoHandler,
  getEventsHandler,
  getTimeBucketsHandler,
  listDataCoresHandler,
  listEventTypesHandler,
  listFlowTypesHandler,
  listTenantsHandler,
} from "./tools"

const OIDC_ISSUER = "https://auth.flowcore.io/realms/flowcore/.well-known/openid-configuration"

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    serviceAccountId: { type: "string" },
    serviceAccountKey: { type: "string" },
  },
  allowPositionals: true,
})

// Log positional arguments if any (for debugging)
if (positionals.length > 0) {
  console.warn(`Warning: Unexpected positional arguments: ${positionals.join(", ")}`)
}

const serviceAccountId = values.serviceAccountId as string
const serviceAccountKey = values.serviceAccountKey as string

if (!serviceAccountId || !serviceAccountKey) {
  throw new Error("No service account credentials provided")
}

const oidcClient = new OidcClient(serviceAccountId, serviceAccountKey, OIDC_ISSUER)
const flowcoreClient = new FlowcoreClient({
  getBearerToken: async () => {
    const token = await oidcClient.getToken()
    return token.accessToken
  },
})

// Create an MCP server
const server = new McpServer({
  name: "Flowcore Platform",
  version: pkg.version,
  description:
    "An MCP server for managing and interacting with Flowcore Platform. For information on the details of the flowcore platform, you can check the Flowcore Platform Data Core, as it houses all actions that have happened in the platform. These actions are called events and are the main building blocks of the platform and housed within the data core inside the event type. The hirearchy of the platform is as follows: Users -> Tenant -> Data Core -> Flow Type -> Event Type -> Events. Tenants and organizations are the same thing in the platform, we are transitioning to use the term tenant. The events are stored in time buckets, and can be fetched by using the get_time_buckets tool. When you fetch events from a time bucket, you can use the cursor to paginate through the events. The default page size is 500 events per page, but you can change this by using the pageSize parameter. Also, the order of the events fetched from each time bucket is ascending by default, but you can change this by using the order parameter but keep in mind that when using desc, pagination and filters are not possible.",
})

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
  "Get event information about an event type, like first and last time bucket and 5 example events",
  {
    eventTypeId: z.string().describe("The event type ID to get information for"),
  },
  getEventTypeInfoHandler(flowcoreClient),
)

server.tool(
  "get_events",
  "Get events for an event type, this can be paginated by using the cursor returned from the previous call. This is good for getting the payload of the events to inspect them.",
  {
    eventTypeId: z.string().describe("The event type ID to get events for"),
    timeBucket: z
      .string()
      .describe(
        "The time bucket to get events from, the timebucket is in the format of YYYYMMDDhhiiss, normally the ii and ss are 0000",
      ),
    cursor: z.string().optional().describe("The paging cursor for pagination"),
    pageSize: z.number().default(500).describe("The number of events per page (default is 500)"),
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
  },
  getEventsHandler(flowcoreClient),
)

server.tool(
  "get_time_buckets",
  "Get time buckets for an event type, this is useful for getting the time buckets for an event type, and then using the get_events tool to get the events for a specific time bucket. The time bucket is in the format of YYYYMMDDhhiiss, normally the ii and ss are 0000. It can be paginated by using the cursor returned from the previous call.",
  {
    eventTypeId: z.string().describe("Event type ID to get time buckets for"),
    fromTimeBucket: z.string().optional().describe("Start time bucket (YYYYMMDDhhiiss)"),
    toTimeBucket: z.string().optional().describe("End time bucket (YYYYMMDDhhiiss)"),
    pageSize: z.number().optional().describe("Number of time buckets per page"),
    cursor: z.number().optional().describe("Pagination cursor"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  },
  getTimeBucketsHandler(flowcoreClient),
)

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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)
