import logger from "../utils/logger";

type SmsResult = {
    success: true;
    provider: string;
};

export async function sendOtpSms(
    phone: string,
    otp: string
): Promise<SmsResult> {
    const enabled = process.env.SMS_PROVIDER_ENABLED === "true";

    if (!enabled) {
        logger.info(`[mock-sms] OTP for ${phone}: ${otp}`);

        return {
            success: true,
            provider: "mock",
        };
    }

    try {
        const twilio = require("twilio")(
            process.env.TWILIO_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        await twilio.messages.create({
            body: `Your  login OTP is ${otp}. It expires in 5 minutes. love from sunil to babita`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: phone,
        });

        logger.info(`OTP SMS sent successfully to ${phone}`);

        return {
            success: true,
            provider: "twilio",
        };
    } catch (error) {
        logger.error("Failed to send OTP SMS", error);

        throw error;
    }
}