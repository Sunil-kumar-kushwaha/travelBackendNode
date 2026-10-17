
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import * as otpService from "../services/otpService";
import { sendOtpSms } from "../services/smsService";
import * as userService from "../services/userService";
import { signToken } from "../utils/token";
import { blacklistToken } from "../services/tokenBlacklistService";
import { ApiError } from "../types/auth.types";
import logger from "../utils/logger";

const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/; 


const googleClient: OAuth2Client | null = process.env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    : null;

function handleError(res: Response, err: unknown, fallbackMessage: string): void {
    if (err instanceof ApiError) {
        res.status(err.status).json({ success: false, message: err.message, code: err.code });
        return;
    }
    logger.error(err);
    res.status(500).json({ success: false, message: fallbackMessage });
}


export async function sendOtp(req: Request, res: Response): Promise<void> {
    const { phone } = req.body as { phone?: string };

    if (!phone || !PHONE_REGEX.test(phone)) {
        res.status(400).json({ success: false, message: "A valid phone number is required" });
        return;
    }

    try {
        const otp = otpService.createOtp(phone);
        console.log("Current Otp", otp);
        await sendOtpSms(phone, otp);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        handleError(res, err, "Could not send OTP");
    }
}


export async function verifyOtp(req: Request, res: Response): Promise<void> {
    const { phone, otp } = req.body as { phone?: string; otp?: string };

    if (!phone || !otp) {
        res.status(400).json({ success: false, message: "phone and otp are required" });
        return;
    }

    try {
        otpService.verifyOtp(phone, String(otp));

        const user = await userService.findOrCreateByPhone(phone);
        const authToken = signToken({ userId: user.id, phone });

        res.status(200).json({ success: true, userId: user.id, authToken });
    } catch (err) {
        handleError(res, err, "Could not verify OTP");
    }
}


export async function googleLogin(req: Request, res: Response): Promise<void> {
    if (!googleClient) {
        res.status(501).json({ success: false, message: "Google login is not configured on the server" });
        return;
    }

    const { credential } = req.body as { credential?: string };
    if (!credential) {
        res.status(400).json({ success: false, message: "credential is required" });
        return;
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload?.email) {
            res.status(401).json({ success: false, message: "Google account has no email" });
            return;
        }

        const user = await userService.findOrCreateByEmail(payload.email, {
            name: payload.name,
            picture: payload.picture,
        });
        const authToken = signToken({ userId: user.id, email: payload.email });

        res.status(200).json({ success: true, userId: user.id, authToken });
    } catch (err) {
        logger.error(err);
        res.status(401).json({ success: false, message: "Invalid Google credential" });
    }
}


export async function logout(req: Request, res: Response): Promise<void> {
    const { jti, exp } = req.user || {};

    if (jti && exp) {
        await blacklistToken(jti, exp);
    }

    res.status(200).json({ success: true, message: "Logged out" });
}