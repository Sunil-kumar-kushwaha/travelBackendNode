import express from "express";

import validate from "../middlewares/validate";
// import requireAuth from "../middlewares/requireAuth";
import { searchFlights, airportAutoComplete } from "../controllers/flight/flightController";
// import { createBookingHandler, getBookingHandler } from "../controllers/booking/bookingController";

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
// router.use(requireAuth);              // every booking route needs a logged-in user
// router.get("/", listBookingsHandler);
// router.post('/bookings', createBookingHandler);
// router.get("/:id", getBookingHandler);



export default router;
