import { Schema, model } from "mongoose";

export interface IUser {
    userId: number;
    phone?: string;
    email?: string;
    name?: string;
    picture?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        userId: { type: Number, required: true, unique: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        name: { type: String, trim: true },
        picture: { type: String },
    },
    { timestamps: true }
);

// unique only when the field actually exists (a Google user has no phone, a phone user has no email)
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: "string" } } });
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

const UserDetails = model<IUser>("UserDetails", userSchema, "UserDetails");
export default UserDetails;