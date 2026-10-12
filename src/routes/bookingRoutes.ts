

import express from "express";
import { createBookingHandler, getBookingHandler } from "../controllers/booking/bookingController";

const router = express.Router();

router.post("/", createBookingHandler);
router.get("/:id", getBookingHandler);

export default router;