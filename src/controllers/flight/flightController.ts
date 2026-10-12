import { Request, Response } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { flightService, AutoCompleteAirportService } from "../../services/flight/flightService";

export const searchFlights = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
        const result = await flightService(req.query);

        return new ApiResponse(
            200,
            result,
            "Flights fetched successfully"
        ).send(res);
    }
);

export const airportAutoComplete = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
        const countryCode = String(req.query.countryCode || "");

        console.log("Search:", countryCode);

        const result = await AutoCompleteAirportService({
            countryCode,
        });

        return new ApiResponse(
            200,
            result,
            "Airport data fetched successfully"
        ).send(res);
    }
);