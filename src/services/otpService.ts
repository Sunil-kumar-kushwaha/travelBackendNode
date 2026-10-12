

import { ApiError } from "../types/auth.types";

interface OtpEntry {
    otp: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
}

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "4", 10);
const OTP_EXPIRES_IN_MS = parseInt(process.env.OTP_EXPIRES_IN_MS || "300000", 10); // 5 min
const RESEND_COOLDOWN_MS = parseInt(process.env.OTP_RESEND_COOLDOWN_MS || "10000", 10); // 10s
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);

const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
    const min = Math.pow(10, OTP_LENGTH - 1);
    const max = Math.pow(10, OTP_LENGTH) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
}

/** Creates and stores a fresh OTP for a phone number. Throws ApiError on cooldown. */
export function createOtp(phone: string): string {
    const existing = otpStore.get(phone);
    const now = Date.now();

    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
        throw new ApiError(`Please wait ${waitSeconds}s before requesting another OTP`, 429, "COOLDOWN");
    }

    const otp = generateOtp();
    otpStore.set(phone, {
        otp,
        expiresAt: now + OTP_EXPIRES_IN_MS,
        attempts: 0,
        lastSentAt: now,
    });

    return otp;
}

/** Verifies an OTP for a phone number. Returns true on success (and clears the entry). */
export function verifyOtp(phone: string, submittedOtp: string): true {
    const entry = otpStore.get(phone);

    if (!entry) {
        throw new ApiError("No OTP was requested for this number, or it already expired", 400, "NOT_FOUND");
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        throw new ApiError("OTP expired. Please request a new one", 400, "EXPIRED");
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(phone);
        throw new ApiError("Too many incorrect attempts. Please request a new OTP", 429, "MAX_ATTEMPTS");
    }

    if (entry.otp !== submittedOtp) {
        entry.attempts += 1;
        throw new ApiError("Incorrect OTP", 400, "MISMATCH");
    }

    otpStore.delete(phone); // one-time use
    return true;
}