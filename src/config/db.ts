import mongoose from "mongoose";

export async function connectDB(): Promise<void> {

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not set in .env");
    mongoose.connection.on("connected", () => console.log("MongoDB connected"));
    mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
    });
}

export async function disconnectDB(): Promise<void> {
    await mongoose.connection.close();
}