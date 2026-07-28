import type { FastifyInstance } from "fastify";
import { validate } from "../../shared/http/validate.js";
import {
  updateUserSchema,
} from "./user.schemas.js";
import {
  updateUserData,
  deleteUser,
} from "./user.service.js";

export async function userRoutes(app: FastifyInstance) {
  app.patch(
  "/me",
  {
    preHandler: async (request) => {
      await request.jwtVerify();

      console.log(
        "PATCH /me BODY:",
        JSON.stringify(request.body, null, 2)
      );
    },
  },
  validate(
    {
      body: updateUserSchema,
    },
    async (request) => {
      const user = request.user as { id: string };

      return await updateUserData(user.id, request.body as any);
    }
  )
);

  app.delete(
    "/me",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (error) {
          console.error("JWT ERROR:", error);

          return reply.code(401).send({
            error: "UNAUTHORIZED",
            message: "Token inválido ou ausente.",
          });
        }
      },
    },
    async (request, reply) => {
      const { id } = request.user as {
        id: string;
      };

      await deleteUser(id);

      return reply.code(200).send({
        message: "Usuário apagado com sucesso.",
      });
    }
  );
}