import type { FastifyInstance } from "fastify";
import { validate } from "../../shared/http/validate.js";
import {
  loginSchema,
  loginWithGoogleSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  tempSignupSchema
} from "./auth.schemas.js";
import {
  confirmEmailAndSetPassword,
  loginUsingEmailAndPassword,
  loginUsingGoogle,
  requestPasswordReset,
  signup
} from "./auth.service.js";


export async function authRoutes(app: FastifyInstance) {

  app.post("/signup", validate({ body: tempSignupSchema }, async (request) => {
    const userToBeCreated = request.body as any;
    return await signup(userToBeCreated);
  }))


  app.post("/confirm-email-setpassword", validate({ body: resetPasswordSchema }, async (request) => {
    const { token, password } = request.body as { token: string; password: string };
    const loggedUser = await confirmEmailAndSetPassword({ token, password });

    const jwtPayload = {
      id: loggedUser.id,
      email: loggedUser.email,
      name: loggedUser.name,
      userType: loggedUser.userType,
      loginType: loggedUser.loginType,
      isEmailConfirmed: loggedUser.isEmailConfirmed,
    };

    const accessToken = app.jwt.sign(
      jwtPayload,
      {
        expiresIn: "7d",
      }
    );

    return {
      user: loggedUser,
      token: accessToken,
      message: "Password atualizada com sucesso."
    };
  }));


  app.post("/request-password-reset", validate({ body: requestPasswordResetSchema }, async (request) => {
    const { email } = request.body as { email: string };
    const token = requestPasswordReset(email.toLowerCase());

    return {
      message: "Se o email existir, enviaremos instrucoes para resetar a password.",
      devResetToken: token
    };
  }));


  app.post("/reset-password", validate({ body: resetPasswordSchema }, async (request) => {
    const { token, password } = request.body as { token: string; password: string };
    //await confirmEmailAndSetPassword(token, password);

    return { message: "Password atualizada com sucesso." };
  }));


  app.post("/login-using-email-and-password", validate({ body: loginSchema }, async (request) => {
    const user = await loginUsingEmailAndPassword(request.body as never);
    const token = app.jwt.sign({
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
      email: user.email
    });

    return { data: user, token };
  }));


  app.post("/login-using-google", validate({ body: loginWithGoogleSchema }, async (request) => {
    const user = await loginUsingGoogle(request.body as never);
    const token = app.jwt.sign({
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
      email: user.email
    });

    return { data: user, token };
  }));

}
