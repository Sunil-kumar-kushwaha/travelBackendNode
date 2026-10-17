import UserDetails, { IUser } from "../models/UserDetails";
import { nextUserId } from "../models/Counter";

export interface User {
    id: number;
    phone: string | null;
    email: string | null;
    name?: string;
    picture?: string;
    createdAt: Date;
}

const toUser = (d: IUser): User => ({
    id: d.userId,
    phone: d.phone ?? null,
    email: d.email ?? null,
    name: d.name,
    picture: d.picture,
    createdAt: d.createdAt,
});

async function findOrCreate(find: () => Promise<IUser | null>, fields: Partial<IUser>): Promise<User> {
    const existing = await find();
    if (existing) return toUser(existing);

    try {
        const created = await UserDetails.create({ userId: await nextUserId(), ...fields });
        return toUser(created);
    } catch (err: any) {
        // two requests created the same user at once: the unique index rejected the loser, so read the winner
        if (err?.code === 11000) {
            const again = await find();
            if (again) return toUser(again);
        }
        throw err;
    }
}

export function findOrCreateByPhone(phone: string): Promise<User> {
    return findOrCreate(() => UserDetails.findOne({ phone }), { phone });
}

export function findOrCreateByEmail(
    email: string,
    extra: Partial<Pick<User, "name" | "picture">> = {}
): Promise<User> {
    const clean = email.trim().toLowerCase();
    return findOrCreate(() => UserDetails.findOne({ email: clean }), { email: clean, ...extra });
}