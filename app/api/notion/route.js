import { NextResponse } from "next/server";

const DATABASES = {
      klanten: "1d20b058-79d0-80e8-8ef1-f9eb328cae57",
      schoonmakers: "1d20b058-79d0-8024-b4f0-ca94c0c7eb84",
      taken: "1d20b058-79d0-8087-b855-f02e244bdc22",
      roosters: "1d20b058-79d0-80f0-bd1e-d17e5dcc8f6a",
      facturatie: "1d20b058-79d0-80a3-87fc-f0d07683b80a",
      voorraad: "1d20b058-79d0-804b-93ae-ed1a4c5e7858",
      kwaliteit: "1d20b058-79d0-8010-b630-c200be84f786",
};

async function queryDatabase(databaseId, notionToken) {
      const res = await fetch(
              `https://api.notion.com/v1/databases/${databaseId}/query`,
          {
                    method: "POST",
                    headers: {
                                Authorization: `Bearer ${notionToken}`,
                                "Notion-Version": "2022-06-28",
                                "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ page_size: 100 }),
          }
            );
      return res.json();
}

function getText(prop) {
      if (!prop) return "";
      if (prop.title) return prop.title.map((t) => t.plain_text).join("");
      if (prop.rich_text) return prop.rich_text.map((t) => t.plain_text).join("");
      if (prop.select) return prop.select?.name || "";
      if (prop.number !== undefined) return prop.number;
      if (prop.date) return prop.date?.start || "";
      if (prop.checkbox !== undefined) return prop.checkbox;
      if (prop.status) return prop.status?.name || "";
      return "";
}

export async function POST(request) {
      try {
              const { action, prompt } = await request.json();
              const notionToken = process.env.NOTION_API_KEY;

        if (!notionToken) {
                  return NextResponse.json(
                      { error: "NOTION_API_KEY not configured" },
                      { status: 500 }
                            );
        }

        if (action === "ai" && process.env.ANTHROPIC_API_KEY) {
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
                              }),
                  });
                  const data = await res.json();
                  const text = data.content
                    ?.filter((b) => b.type === "text")
                    .map((b) => b.text)
                    .join("\n");
                  return NextResponse.json({ text: text || "" });
        }

        const results = {};
              for (const [name, id] of Object.entries(DATABASES)) {
                        try {
                                    const data = await queryDatabase(id, notionToken);
                                    results[name] = {
                                                  count: data.results?.length || 0,
                                                  items: (data.results || []).map((page) => {
                                                                  const props = {};
                                                                  for (const [key, val] of Object.entries(page.properties || {})) {
                                                                                    props[key] = getText(val);
                                                                  }
                                                                  return { id: page.id, ...props };
                                                  }),
                                    };
                        } catch (e) {
                                    results[name] = { count: 0, items: [], error: e.message };
                        }
              }

        const summary = {
                  totaalKlanten: results.klanten?.count || 0,
                  totaalSchoonmakers: results.schoonmakers?.count || 0,
                  openTaken: results.taken?.items?.filter(
                              (t) => t.Status && t.Status !== "Voltooid" && t.Status !== "Done"
                            ).length || 0,
                  totaalTaken: results.taken?.count || 0,
                  aiEnabled: !!process.env.ANTHROPIC_API_KEY,
        };

        return NextResponse.json({ summary, data: results });
      } catch (error) {
              console.error("API error:", error);
              return NextResponse.json({ error: error.message }, { status: 500 });
      }
}
