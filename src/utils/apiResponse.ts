import { Response } from "express";

class ApiResponse<T = unknown> {
    public statusCode: number;
    public success: boolean;
    public message: string;
    public data: T;

    constructor( statusCode: number, data: T, message: string = "Success" ) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }

    send(res: Response): Response {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data,
        });
    }
}

export default ApiResponse;