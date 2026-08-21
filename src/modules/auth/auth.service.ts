import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AppError } from "../../shared/errors/app-error.js";
import { toPublicUser, type ProfileData } from "../users/user.model.js";
import { getUserRepository } from "../users/user.repository.js";

import type { ConfirmEmailInput, LoginInput, LoginWithGoogleInput, TempSignupInput } from "./auth.schemas.js";
import { sendConfirmationEmail } from "../../libs/emailService.js";
import { verifyGoogleIdToken, type GoogleProfile } from "../../libs/googleAuth.js";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutos
const CONFIRMATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

export async function signup(input: TempSignupInput) {
  const userRepository = getUserRepository();
  const normalizedEmail = input.email.toLowerCase();

  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("409", "Já existe uma conta com este email.", 409);
  }

  const now = new Date();
  const isGoogleSignup = input.loginType === "google";

  // Password aleatória em ambos os casos — no fluxo "normal" é temporária até a
  // confirmação; no fluxo "google" nunca chega a ser usada (login é via OAuth),
  // mas mantemos o hash para nunca deixar passwordHash vazio/undefined.
  const randomPassword = nanoid(24);
  const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

  const emailConfirmationToken = isGoogleSignup ? null : nanoid(32);
  const emailConfirmationExpiresAt = isGoogleSignup
    ? null
    : new Date(Date.now() + CONFIRMATION_TOKEN_TTL_MS);

  const initialProfileData = input.profileData?.username
    ? ({ username: input.profileData.username } as ProfileData)
    : null;

  const newUser = await userRepository.createUser({
    id: nanoid(),
    name: input.name,
    email: normalizedEmail,
    loginType: input.loginType,
    userType: "normal",
    imageUrl: String(input?.imageUrl || ""),
    passwordHash,
    profileData: initialProfileData,
    isActive: true,
    isEmailConfirmed: isGoogleSignup, // Google já confirmou o email
    emailConfirmationToken,
    emailConfirmationExpiresAt,
    createdAt: now,
    updatedAt: now,
  });

  if (!isGoogleSignup) {
    try {
      await sendConfirmationEmail(newUser.email, newUser.name, emailConfirmationToken!);
    } catch (err) {
      console.log(err);
      //request.log.error({ err, email: newUser.email }, "Falha ao enviar email de confirmação");
      // não relança — user foi criado, token existe, pode reenviar depois
    }
  }

  return {
    user: toPublicUser(newUser),
    emailConfirmationToken,
    requiresEmailConfirmation: !isGoogleSignup,
  };
}

export async function confirmEmailAndSetPassword(input: ConfirmEmailInput) {
  const userRepository = getUserRepository();

  const user = await userRepository.findByConfirmationToken(input.token);

  if (!user || !user.emailConfirmationExpiresAt || user.emailConfirmationExpiresAt < new Date()) {
    throw new AppError("400", "Token de confirmação inválido ou expirado.", 400);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const updatedUser = await userRepository.updateUser(user.id, {
    passwordHash,
    isEmailConfirmed: true,
    emailConfirmationToken: null,
    emailConfirmationExpiresAt: null,
  });

  if (!updatedUser) {
    throw new AppError("500", "Falha ao confirmar conta.", 500);
  }

  return toPublicUser(updatedUser);
}


export async function loginUsingEmailAndPassword(input: LoginInput) {
  const userRepository = getUserRepository();
  const normalizedEmail = input.email.toLowerCase();

  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user || !user.passwordHash) {
    throw new AppError("401", "Email ou password inválidos.", 401);
  }

  if (!user.isActive) {
    throw new AppError("403", "Conta desativada.", 403);
  }

  if (!user.isEmailConfirmed) {
    throw new AppError("403", "Confirme o seu email antes de entrar.", 403);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("401", "Email ou password inválidos.", 401);
  }

  return toPublicUser(user);
}


export async function loginUsingGoogle(input: LoginWithGoogleInput) {
  const profile = await verifyGoogleIdToken(input.idToken);
  const userRepository = getUserRepository();
  const normalizedEmail = profile.email.toLowerCase();

  const existingUser = await userRepository.findByEmail(normalizedEmail);
  const user = existingUser ?? await createUserFromGoogle(profile);

  if (!user.isActive) {
    throw new AppError("403", "Conta desativada.", 403);
  }

  return toPublicUser(user);
}

async function createUserFromGoogle(profile: GoogleProfile) {
  const userRepository = getUserRepository();
  const now = new Date();

  // Password aleatória: nunca é usada para autenticar (login é via OAuth), mas
  // mantemos o hash para nunca deixar passwordHash vazio/undefined.
  const randomPassword = nanoid(24);
  const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

  return userRepository.createUser({
    id: nanoid(),
    name: profile.name,
    email: profile.email.toLowerCase(),
    loginType: "google",
    userType: "normal",
    imageUrl: profile.imageUrl ?? "",
    passwordHash,
    profileData: null,
    isActive: true,
    isEmailConfirmed: true, // Google já confirmou o email
    emailConfirmationToken: null,
    emailConfirmationExpiresAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function requestPasswordReset(email: string) {
  const userRepository = getUserRepository();
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) return; // não revela se o email existe

  const emailConfirmationToken = nanoid(32);

  try {
    await sendConfirmationEmail(user.email, user.name, emailConfirmationToken!);
  } catch (err) {
    console.log(err);
    //request.log.error({ err, email: newUser.email }, "Falha ao enviar email de confirmação");
    // não relança — user foi criado, token existe, pode reenviar depois
  }

}


export async function resetPassword(token: string, password: string) {
  const userRepository = getUserRepository();
  const user = await userRepository.findByResetToken(token);

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    throw new AppError("400", "Token inválido ou expirado.", 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await userRepository.updateUser(user.id, {
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
  });
}