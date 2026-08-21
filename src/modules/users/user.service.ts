import { getUserRepository } from "./user.repository.js";
import { toPublicUser, type User } from "./user.model.js";
import type { UpdateUserInput } from "./user.schemas.js";

export async function getUsersData() {
  const userRepository = getUserRepository();
  const users = await userRepository.findAllUsers();

  return {
    users: users.map(toPublicUser),
  };
}

export async function updateUserData(
  userId: string,
  input: UpdateUserInput
) {
  const userRepository = getUserRepository();

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new Error("Utilizador n\u00e3o encontrado.");
  }

  const updatedUser = await userRepository.updateUser(
    userId,
    {
      ...(input.name ? { name: input.name } : {}),
      ...(input.profileData ? { profileData: input.profileData } : {}),
    } as Partial<Omit<User, "id">>
  );

  if (!updatedUser) {
    throw new Error(
      "N\u00e3o foi poss\u00edvel atualizar os dados do perfil."
    );
  }

  return {
    user: toPublicUser(updatedUser),
    message: "Dados do perfil atualizados com sucesso.",
  };
}

export async function deleteUser(userId: string): Promise<void> {
  const userRepository = getUserRepository();

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new Error("Utilizador n\u00e3o encontrado.");
  }

  const deleted = await userRepository.deleteUser(userId);

  if (!deleted) {
    throw new Error(
      "N\u00e3o foi poss\u00edvel apagar o utilizador."
    );
  }
}