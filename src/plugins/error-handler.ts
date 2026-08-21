import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../shared/errors/app-error.js";

export function errorHandler(
  error: FastifyError | AppError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message
    });
  }

  if ("validation" in error && error.validation) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Payload invalido.",
      details: error.validation
    });
  }

  _request.log.error(error);

  return reply.status(500).send({
    error: "INTERNAL_SERVER_ERROR",
    message: "Erro interno do servidor."
  });
}
