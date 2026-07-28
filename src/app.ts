import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { errorHandler } from "./plugins/error-handler.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { mongoPlugin } from "./plugins/mongo.js";

import { initUserRepository } from "./modules/users/user.repository.js";

const app = Fastify({
  logger: true
  // logger: {
  //   level: process.env.NODE_ENV === "test" ? "silent" : "info"
  // }
});

await app.register(helmet);
await app.register(cors, { origin: true });
await app.register(sensible);
await app.register(mongoPlugin);
await app.register(jwtPlugin);

initUserRepository(app.mongo.db);

app.setErrorHandler(errorHandler);

app.get("/health", async () => ({
  status: "ok",
  service: "Rede Back-End Working"
}));

await app.register(authRoutes, { prefix: "/api/v1/auth" });
await app.register(userRoutes, { prefix: "/api/v1/users" });

await app.ready();

export default app;