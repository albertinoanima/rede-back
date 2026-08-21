// src/plugins/mongo.ts
import fp from "fastify-plugin";
import { MongoClient, type Db } from "mongodb";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    mongo: {
      client: MongoClient;
      db: Db;
    };
  }
}

export const mongoPlugin = fp(async (app: FastifyInstance) => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME ?? "rede-app";

  if (!uri) {
    throw new Error("MONGODB_URI não está definida nas variáveis de ambiente.");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  app.log.info(`Conectado ao MongoDB Atlas (db: ${dbName})`);

  app.decorate("mongo", { client, db });

  app.addHook("onClose", async (instance) => {
    await instance.mongo.client.close();
    instance.log.info("Conexão MongoDB fechada.");
  });
});