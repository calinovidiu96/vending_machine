import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
