import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string;
      userType?: "normal" | "admin";
    };
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string;
      userType?: "normal" | "admin";
    };
  }
}
