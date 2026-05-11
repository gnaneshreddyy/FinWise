/* eslint-env node */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function stripMarkdownFences(text = "") {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

async function generateGroqResponse(prompt, responseFormat = "text") {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in server environment");
  }

  const completion = await client.chat.completions.create({
    model: groqModel,
    temperature: 0.2,
    response_format: responseFormat === "json" ? { type: "json_object" } : undefined,
    messages: [
      {
        role: "system",
        content: "You are a helpful personal finance AI assistant.",
      },
      { role: "user", content: prompt },
    ],
  });

  return completion.choices?.[0]?.message?.content || "";
}

// Route for chatbot
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const reply = await generateGroqResponse(prompt, "text");
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/insights", async (req, res) => {
  try {
    const { expenseData } = req.body;

    if (!Array.isArray(expenseData)) {
      return res.status(400).json({ error: "expenseData must be an array" });
    }

    const prompt = [
      "You are an expert data visualization assistant specialized in personal finance.",
      "Analyze the expense dataset and respond with strict JSON only.",
      "Return exactly this object shape:",
      "{",
      '  "insights": string[],',
      '  "charts": [',
      "    {",
      '      "type": "BarChart" | "LineChart" | "PieChart" | "AreaChart",',
      '      "title": string,',
      '      "description": string,',
      '      "dataKey": string,',
      '      "additionalProps": object,',
      '      "xField"?: string,',
      '      "yField"?: string,',
      '      "categoryField"?: string,',
      '      "valueField"?: string',
      "    }",
      "  ]",
      "}",
      "Rules:",
      "- Provide 3 to 5 concise insights.",
      "- Provide exactly 4 charts including one each of BarChart, LineChart, PieChart, and AreaChart.",
      "- Use field names matching the dataset keys when relevant.",
      "- Do not include markdown, commentary, or code fences.",
      "",
      `Dataset: ${JSON.stringify(expenseData)}`,
    ].join("\n");

    const raw = await generateGroqResponse(prompt, "json");
    const parsed = JSON.parse(stripMarkdownFences(raw));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/personalization/rewards", async (req, res) => {
  // Non-squad point sources are disabled. Points are now awarded only for
  // username-based squad/community participation actions in Firestore.
  res.status(410).json({
    error: "Personalization rewards are disabled. Use squad/community actions for points.",
  });
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
