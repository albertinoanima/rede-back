import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/app-error.js";

export type GoogleProfile = {
  email: string;
  name: string;
  imageUrl?: string;
};

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError("500", "Login com Google não está configurado no servidor.", 500);
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("401", "Token do Google inválido ou expirado.", 401);
  }

  if (!payload?.email || !payload.email_verified) {
    throw new AppError("401", "Não foi possível confirmar o email da conta Google.", 401);
  }

  return {
    email: payload.email,
    name: payload.name ?? payload.email,
    imageUrl: payload.picture,
  };
}
