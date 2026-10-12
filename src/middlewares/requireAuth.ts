



import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import { isTokenBlacklisted } from "../services/tokenBlacklistService";

export default async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers["myweb-user-token"] as string | undefined;

    if (!token) {
        res.status(401).json({ success: false, message: "Not logged in" });
        return;
    }

    try {
        const decoded = verifyToken(token);

        if (await isTokenBlacklisted(decoded.jti)) {
            res.status(401).json({ success: false, message: "Session has been logged out" });
            return;
        }

        req.user = decoded;
        req.token = token;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Session expired or invalid" });
    }
}