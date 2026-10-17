
import express from "express";
import requireAuth from "../middlewares/requireAuth";
import { createBookingHandler, getBookingHandler, listBookingsHandler } from "../controllers/booking/bookingController";

const router = express.Router();

router.use(requireAuth);              // every booking route needs a logged-in user
router.get("/", listBookingsHandler); // must come before "/:id"
router.post("/", createBookingHandler);
router.get("/:id", getBookingHandler);

export default router;