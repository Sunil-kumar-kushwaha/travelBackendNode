/// routes/authRoutes.ts

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendOtp, verifyOtp, googleLogin, logout } from "../controllers/authController";
import requireAuth from "../middlewares/requireAuth";

const router = Router();


const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP requests, please try again later." },
});

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/google", googleLogin);
router.post("/logout", requireAuth, logout);

export default router;