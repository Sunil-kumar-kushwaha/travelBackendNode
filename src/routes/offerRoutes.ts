

import express from "express";
import { listOffers, applyOffer } from "../controllers/offer/offerController";

const router = express.Router();

router.get("/", listOffers);
router.post("/apply", applyOffer);

export default router;

// ------------------------------------------------------------
// travelBackend/src/routes/bookingRoutes.ts
// ------------------------------------------------------------
//
// import express from "express";
// import { createBookingHandler, getBookingHandler } from "../controllers/booking/bookingController";
//
// const router = express.Router();
// router.post("/", createBookingHandler);
// router.get("/:id", getBookingHandler);
// export default router;

// ------------------------------------------------------------
// travelBackend/src/routes/paymentRoutes.ts
// ------------------------------------------------------------
//
// import express from "express";
// import { pay } from "../controllers/payment/paymentController";
//
// const router = express.Router();
// router.post("/pay", pay);
// export default router;

// ------------------------------------------------------------
// Add to app.ts:
// ------------------------------------------------------------
//
// import offerRoutes from "./routes/offerRoutes";
// import bookingRoutes from "./routes/bookingRoutes";
// import paymentRoutes from "./routes/paymentRoutes";
//
// app.use("/api/offers", offerRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/payments", paymentRoutes);