// types/auth.types.ts

export interface JwtPayload {
    userId: number;
    phone?: string;
    email?: string;
    jti?: string;   // unique token id, set on sign, used for blacklisting on logout
    iat?: number;   // set automatically by jsonwebtoken
    exp?: number;   // set automatically by jsonwebtoken
}

export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status = 500, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}


declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            token?: string; // raw bearer token, set by requireAuth for handlers like logout
        }
    }
}