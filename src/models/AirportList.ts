import { Schema, model, Document } from "mongoose";

export interface IAirport {
    code: string;
    name: string;
    country: string;
    city: string;
    countryCode: string;
}

export interface IAirportList extends Document {
    apts: IAirport[];
    cntryWiseApts: unknown[];
    phoneticApts: unknown[];
    nearByApts: unknown[];
    countries: unknown[];
}

const airportSchema = new Schema<IAirport>(
    {
        code: { type: String, required: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        countryCode: { type: String, required: true, trim: true, lowercase: true },
    },
    { _id: false }
);

const airportListSchema = new Schema<IAirportList>({
    apts: { type: [airportSchema], default: [] },
    cntryWiseApts: { type: [Schema.Types.Mixed], default: [] }, // use Mixed until you know their shape
    phoneticApts: { type: [Schema.Types.Mixed], default: [] },
    nearByApts: { type: [Schema.Types.Mixed], default: [] },
    countries: { type: [Schema.Types.Mixed], default: [] },
});

const AirportList = model<IAirportList>("AirportList", airportListSchema, "AirportList");
export default AirportList;