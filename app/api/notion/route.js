import { NextResponse } from "next/server";

export async function POST(request) {
    try {
          const { prompt } = await request.json();

      const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 2000,
                        messages: [{ role: "user", content: prompt }],
                        mcp_servers: [
                          {
                                        type: "url",
                                        url: "https://mcp.notion.com/mcp",
                                        name: "notion",
                                        authorization_token: process.env.NOTION_MCP_TOKEN,
                          },
                                  ],
              }),
      });

      const data = await res.json();
          const text = data.content
            ?.filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("\n");

      return NextResponse.json({ text: text || "" });
    } catch (error) {
          console.error("API error:", error);
          return NextResponse.json({ text: "", error: error.message }, { status: 500 });
    }
}
