/* eslint-env node */
import { createApp } from './src/app.js';
import { env } from './src/config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
