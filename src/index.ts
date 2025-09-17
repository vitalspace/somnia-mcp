import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { resgisterTools } from "./tools/tools";
const initServer = async () => {
  try {
    const server = new McpServer({
      name: "Somnia MPC",
      version: "0.0.1",
    });
    resgisterTools(server);
    console.log(`Somnia MCP Server initialized`);

    return server;
  } catch (error) {
    console.log("Error initializing server:", error);
  }
};

const main = async () => {
  try {
    const server = await initServer();
    const transport = new StdioServerTransport();
    await server?.connect(transport);
    console.log("Somnia MCP Server running on stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
