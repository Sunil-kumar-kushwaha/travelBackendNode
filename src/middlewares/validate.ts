import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import ApiError from "../utils/apiError";

const validate = (
    schema: ZodType,
    property: "body" | "query" | "params" = "body"
) =>
    (req: Request, res: Response, next: NextFunction): void => {
        console.log(`Validating ${property}`);

        const result = schema.safeParse(req[property]);

        if (!result.success) {
            const messages = result.error.issues.map(
                (issue) => issue.message
            );

            return next(
                new ApiError(400, "Validation failed", messages)
            );
        }

        next();
    };

export default validate;