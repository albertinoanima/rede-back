import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError("UNAUTHORIZED", "Autenticacao necessaria.", 401);
  }
}
