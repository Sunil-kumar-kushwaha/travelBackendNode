import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import ApiError from "../utils/apiError";

export const notFound = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    let error = err;

    if (!(error instanceof ApiError)) {
        // Mongoose validation error
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (e: any) => e.message
            );

            error = new ApiError(400, "Validation failed", messages);
        }
        // Invalid ObjectId
        else if (error.name === "CastError") {
            error = new ApiError(
                400,
                `Invalid value for ${error.path}: ${error.value}`
            );
        }
        // Duplicate key
        else if (error.code === 11000) {
            error = new ApiError(409, "Duplicate field value", [
                JSON.stringify(error.keyValue),
            ]);
        }
        // Generic error
        else {
            error = new ApiError(
                error.statusCode || 500,
                error.message || "Internal Server Error"
            );
        }
    }

    logger.error(
        `[PID ${process.pid}] ${req.method} ${req.originalUrl} -> ${error.statusCode} ${error.message}`
    );

    return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors ?? [],
        ...(process.env.NODE_ENV !== "production" && {
            stack: err.stack,
        }),
    });
};