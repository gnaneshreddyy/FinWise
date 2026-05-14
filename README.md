# 💰 FinWise

> A smart and simple personal finance analyzer that helps users visualize, understand, and improve their spending habits.

---

## ✨ Features

- 📊 **Visual Reports:** Interactive charts to track income, expenses, and savings  
- 💡 **Insights Panel:** Highlights spending trends and saving opportunities  
- ⚙️ **Dynamic Dashboard:** Real-time updates with a smooth, responsive design  
- 👤 **Personalized Experience:** Tailors insights based on user behavior  
- 🔐 **Privacy Focused:** No external data sharing — everything runs locally

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## AI setup (Groq OpenAI-compatible)

Insights, chatbot, and personalization AI requests now go through the backend (`backend/server.js`) so your API key is not exposed in the browser.

### Backend env vars

Use your existing root `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
# optional
GROQ_MODEL=llama-3.1-8b-instant
```

### Frontend env vars

Create `.env` in project root (for Vite app):

```
VITE_API_BASE_URL=http://localhost:5000
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
```

### Endpoints used

- `POST /insights` -> Generates structured insights/charts JSON from expense data.
- `POST /chat` -> Generates chatbot replies.
- `POST /personalization/rewards` -> Generates personalization rewards output.
