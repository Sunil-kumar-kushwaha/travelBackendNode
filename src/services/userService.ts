

export interface User {
    id: number;
    phone: string | null;
    email: string | null;
    name?: string;
    picture?: string;
    createdAt: number;
}

const usersByKey = new Map<string, User>(); // key = phone or email
let nextId = 1;

export function findOrCreateByPhone(phone: string): User {
    const existing = usersByKey.get(phone);
    if (existing) return existing;

    const user: User = { id: nextId++, phone, email: null, createdAt: Date.now() };
    usersByKey.set(phone, user);
    return user;
}

export function findOrCreateByEmail(
    email: string,
    extra: Partial<Pick<User, "name" | "picture">> = {}
): User {
    const existing = usersByKey.get(email);
    if (existing) return existing;

    const user: User = { id: nextId++, phone: null, email, ...extra, createdAt: Date.now() };
    usersByKey.set(email, user);
    return user;
}