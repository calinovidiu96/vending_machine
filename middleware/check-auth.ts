import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Session } from "../models/session";

declare module "express-serve-static-core" {
	interface Request {
		userData?: { userId: string; sessionId: string };
	}
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	try {
		// streamline the handling of CORS
		if (req.method === "OPTIONS") {
			return next();
		}

		const token = req.headers.authorization?.split(" ")[1]; // Authorization "Bearer Token"
		if (!token) {
			throw new Error("Authentication failed.");
		}

		const decodedToken = jwt.verify(token, process.env.JWT_KEY as string);

		if (
			!decodedToken ||
			typeof decodedToken !== "object" ||
			!decodedToken.userId
		) {
			throw new Error("Invalid token.");
		}

		// Pass the decoded token to the next middleware
		req.userData = {
			userId: decodedToken.userId,
			sessionId: decodedToken.sessionId,
		};

		next();
	} catch (err) {
		const error = new Error("Authentication failed.");
		return next(error);
	}
};

// Middleware to check session
export const checkSession = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// Skip session authentication for tests
		const isTestEnvironment = process.env.NODE_ENV === "test";

		if (isTestEnvironment) {
			return next();
		}

		const sessionId = req.userData?.sessionId;

		const activeSession = await Session.findOne({ sessionId });

		if (!activeSession) {
			throw new Error("Invalid session.");
		}

		next();
	} catch (err: any) {
		const error = new Error("Session verification failed.");
		return next(error);
	}
};
