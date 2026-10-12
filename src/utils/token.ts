// utils/token.ts

import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { JwtPayload } from "../types/auth.types";

const JWT_SECRET: string = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

export function signToken(payload: Omit<JwtPayload, "jti" | "iat" | "exp">): string {
    const jti = crypto.randomUUID(); // unique per token, used to blacklist on logout
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as SignOptions["expiresIn"],
        jwtid: jti,
    };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}