import { Schema, model, Document } from "mongoose";

export interface IFlight extends Document {
    flightId: string;
    flightNumber: string;
    airline: string;
    source: string;
    destination: string;
    departureTime: Date;
    arrivalTime: Date;
    duration: string;
    price: number;
    stops: number;
    availableSeats: number;
    cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const flightSchema = new Schema<IFlight>(
    {
        flightId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        flightNumber: {
            type: String,
            required: true,
            trim: true,
        },
        airline: {
            type: String,
            required: true,
            trim: true,
        },
        source: {
            type: String,
            required: true,
            trim: true,
        },
        destination: {
            type: String,
            required: true,
            trim: true,
        },
        departureTime: {
            type: Date,
            required: true,
        },
        arrivalTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stops: { 
            type: Number, 
            default: 0, 
            min: 0 
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 0,
        },
        cabinClass: {
            type: String,
            enum: ["Economy", "Premium Economy", "Business", "First"],
            default: "Economy",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Useful indexes for searching
flightSchema.index({ source: 1, destination: 1, departureTime: 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ price: 1 });

const Flight = model<IFlight>("Flight", flightSchema, "Flight"); 

export default Flight;