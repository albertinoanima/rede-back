import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";
import type { z } from "zod";

type ValidationSchemas = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export function validate(
  schemas: ValidationSchemas,
  handler: RouteHandlerMethod
): RouteHandlerMethod {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (schemas.body) request.body = schemas.body.parse(request.body);
    if (schemas.params) request.params = schemas.params.parse(request.params);
    if (schemas.query) request.query = schemas.query.parse(request.query);

    const routeHandler = handler as (
      request: FastifyRequest,
      reply: FastifyReply
    ) => unknown;

    return routeHandler(request, reply);
  };
}
