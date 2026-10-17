import { Schema, model } from "mongoose";

interface ICounter {
    _id: string;
    seq: number;
}

const counterSchema = new Schema<ICounter>({
    _id: { type: String },
    seq: { type: Number, default: 0 },
});

const Counter = model<ICounter>("Counter", counterSchema, "Counter");

// atomic: two simultaneous signups can never get the same id
export async function nextUserId(): Promise<number> {
    const doc = await Counter.findOneAndUpdate(
        { _id: "userId" },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );
    return doc!.seq;
}

export default Counter;