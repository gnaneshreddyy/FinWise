# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

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
```

### Endpoints used

- `POST /insights` -> Generates structured insights/charts JSON from expense data.
- `POST /chat` -> Generates chatbot replies.
- `POST /personalization/rewards` -> Generates personalization rewards output.
