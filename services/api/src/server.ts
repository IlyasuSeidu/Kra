import { loadApiRuntimeConfig } from "./config";
import { createRuntimeApiApp } from "./app";

async function main(): Promise<void> {
  const config = loadApiRuntimeConfig();
  const app = createRuntimeApiApp(config);

  try {
    await app.listen({
      host: "0.0.0.0",
      port: config.apiPort
    });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

void main();
