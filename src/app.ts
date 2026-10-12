import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import flightRoutes from "./routes/flightRoutes";
import authRoutes from "./routes/authRoutes";
import offerRoutes from "./routes/offerRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import requireAuth from "./middlewares/requireAuth";

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again shortly." },
});

const app = express();

app.use(
    cors({
        origin: (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(","),
        credentials: true,
    })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
    res.status(200).json({ success: true, pid: process.pid, uptime: process.uptime() });
});
app.get("/", (_, res) => {
    console.log("Health check endpoint hit");
    res.json({
        success: true,
        message: "Travel API is running 🚀",
    });
});

// --- Routes ---
app.use("/api/flights", flightRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
// app.use('/api/hotels', hotelRoutes);

// Example protected route — remove or replace once you have real ones that need auth.
app.get("/api/me", requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

export default app;