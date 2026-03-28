import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API http://localhost:${env.PORT}`);
  console.log(`Swagger http://localhost:${env.PORT}/docs`);
});
