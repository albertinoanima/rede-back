import { nanoid } from "nanoid";

export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export class MemoryStore<T extends BaseEntity> {
  private readonly items = new Map<string, T>();

  all() {
    return Array.from(this.items.values());
  }

  findById(id: string) {
    return this.items.get(id) ?? null;
  }

  create(data: Omit<T, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const entity = {
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
      ...data
    } as T;

    this.items.set(entity.id, entity);
    return entity;
  }

  update(id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>) {
    const current = this.findById(id);
    if (!current) return null;

    const updated = {
      ...current,
      ...data,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }
}
