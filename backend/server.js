import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Hardcode API key here for now
const genAI = new GoogleGenerativeAI("AIzaSyBlAmW_WeRgVIC0tqL3wIFiViZkcBpdwEM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Route for chatbot
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
