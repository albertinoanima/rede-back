import type { Collection, Db } from "mongodb";
import type { User } from "./user.model.js";

const COLLECTION_NAME = "users";

class UserRepository {
  private collection: Collection<User>;

  constructor(db: Db) {
    this.collection = db.collection<User>(COLLECTION_NAME);
  }

  async createUser(user: User): Promise<User> {
    await this.collection.insertOne(user);
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.collection.findOne({ id } as Partial<User>);
  }

  async findAllUsers(): Promise<User[]> {
    return this.collection.find({}).toArray();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email: email.toLowerCase() } as Partial<User>);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.collection.findOne({ passwordResetToken: token } as Partial<User>);
  }

  async updateUser(id: string, updates: Partial<Omit<User, "id">>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { id } as Partial<User>,
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result ?? null;
  }

  async findByConfirmationToken(token: string): Promise<User | null> {
    return this.collection.findOne({ emailConfirmationToken: token } as Partial<User>);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User | null> {
    return this.updateUser(id, { passwordHash } as Partial<Omit<User, "id">>);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id } as Partial<User>);
    return result.deletedCount === 1;
  }
}

export { UserRepository };

export function createUserRepository(db: Db): UserRepository {
  return new UserRepository(db);
}

// --- Singleton lazy: guarda a instância única, criada assim que a app arranca ---

let _userRepository: UserRepository | null = null;

export function initUserRepository(db: Db): UserRepository {
  _userRepository = createUserRepository(db);
  return _userRepository;
}

export function getUserRepository(): UserRepository {
  if (!_userRepository) {
    throw new Error(
      "userRepository ainda não foi inicializado. Chama initUserRepository(db) no app.ts primeiro."
    );
  }
  return _userRepository;
}