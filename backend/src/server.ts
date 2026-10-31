import { buildApp } from "./app.js";
import { config } from "./config.js";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    console.log(
      `[API] Campus FOMO server running on http://${config.HOST}:${config.PORT}/api/v1`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
