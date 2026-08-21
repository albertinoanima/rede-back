import app from "./app.js";
import { env } from "./config/env.js";

try {
  await app.listen({ host: env.HOST, port: env.PORT });
  //app.listen({ port: 3000, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}



