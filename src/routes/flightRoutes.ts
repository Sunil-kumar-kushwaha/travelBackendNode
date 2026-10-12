import express from "express";

import validate from "../middlewares/validate";
import { searchFlights, airportAutoComplete } from "../controllers/flight/flightController";
import {
    searchFlightSchema,
    // flightIdParamSchema,
    // availabilitySchema,
    // blockInventorySchema,
    AirportAutoCompleteSchema,
} from "../validations/flightValidation";

const router = express.Router();

router.get('/airports-auto', validate(AirportAutoCompleteSchema, 'query'), airportAutoComplete);
router.get('/search', validate(searchFlightSchema, 'query'), searchFlights);



export default router;