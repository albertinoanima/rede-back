import { getUserRepository } from "./user.repository.js";
import { toPublicUser, type User } from "./user.model.js";
import type { UpdateUserInput } from "./user.schemas.js";

export async function updateUserData(
  userId: string,
  input: UpdateUserInput
) {
  const userRepository = getUserRepository();

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const updatedUser = await userRepository.updateUser(
    userId,
    {
      profileData: input.profileData,
    } as Partial<Omit<User, "id">>
  );

  if (!updatedUser) {
    throw new Error(
      "Não foi possível atualizar os dados do perfil."
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
    throw new Error("Usuário não encontrado.");
  }

  const deleted = await userRepository.deleteUser(userId);

  if (!deleted) {
    throw new Error(
      "Não foi possível apagar o usuário."
    );
  }
}