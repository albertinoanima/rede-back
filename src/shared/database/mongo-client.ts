// src/shared/database/mongo-client.ts
import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "your-app-name";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI não está definida nas variáveis de ambiente.");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGODB_URI as string);
  await client.connect();
  db = client.db(MONGODB_DB_NAME);

  console.log(`Conectado ao MongoDB Atlas (db: ${MONGODB_DB_NAME})`);
  return db;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Base de dados ainda não inicializada. Chama connectToDatabase() primeiro.");
  }
  return db;
}