import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user";
import { Session } from "../models/session";

const generateSessionId = () => {
	return Math.random().toString(36).substring(2, 15);
};

const updateSessionInfo = async (userId: string, sessionId: string) => {
	const session = new Session({
		userId,
		sessionId,
	});

	await session.save();
};

export const signup: RequestHandler = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(500).json({
				message: "Invalid inputs passed, please check your data.",
			});
		}

		const { username, password, role } = req.body;

		const existingUsers = await User.findOne({ username });
		if (existingUsers) {
			return res.status(404).json({
				message: "Username already exists, please login instead.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const createdUser = new User({
			username,
			password: hashedPassword,
			deposit: 0,
			role,
		});

		await createdUser.save();

		let sessionId;

		if (process.env.NODE_ENV !== "test") {
			sessionId = generateSessionId();
			updateSessionInfo(createdUser._id.toString(), sessionId);
		} else {
			sessionId = null;
		}

		const token = jwt.sign(
			{
				userId: createdUser._id,
				name: createdUser.username,
				role: createdUser.role,
				sessionId,
			},
			process.env.JWT_KEY as string
		);

		res.status(201).json({
			message: "User created successfully.",
			accessToken: token,
		});
	} catch (err: any) {
		next(new Error(`Signing up failed. ${err.message}`));
	}
};

export const login: RequestHandler = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(500).json({
				message: "Invalid inputs passed, please check your data.",
			});
		}

		const { username, password } = req.body;

		const existingUser = await User.findOne({ username });
		if (!existingUser) {
			return res.status(404).json({
				message: "Invalid credentials.",
			});
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			existingUser.password
		);
		if (!isPasswordValid) {
			return res.status(404).json({ message: "Invalid credentials." });
		}

		let sessionId;

		if (process.env.NODE_ENV !== "test") {
			sessionId = generateSessionId();
			updateSessionInfo(existingUser._id.toString(), sessionId);
		} else {
			sessionId = null;
		}

		const token = jwt.sign(
			{
				userId: existingUser._id,
				name: existingUser.username,
				role: existingUser.role,
				sessionId,
			},
			process.env.JWT_KEY as string
		);

		res.json({
			message: "User logedin successfully.",
			accessToken: token,
		});
	} catch (err: any) {
		next(new Error(`Login failed. ${err.message}`));
	}
};

export const deposit: RequestHandler = async (req, res, next) => {
	const { amount } = req.body;
	const userId = req.userData?.userId;

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(500).json({
				message: "Invalid inputs passed, please check your data.",
			});
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.role === "seller") {
			return res
				.status(400)
				.json({ message: "You can't deposit credits as a seller." });
		}

		user.deposit += amount;

		await user.save();

		res.status(200).json({
			message: "Deposit updated successfully",
			newDeposit: user.deposit,
		});
	} catch (err: any) {
		next(new Error(`Deposit credits failed. ${err.message}`));
	}
};

export const reset: RequestHandler = async (req, res, next) => {
	const userId = req.userData?.userId;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.role === "seller") {
			return res
				.status(400)
				.json({ message: "You can't reset credit as a seller." });
		}

		user.deposit = 0;

		await user.save();

		res.status(200).json({
			message: "Reset successfully",
			newDeposit: user.deposit,
		});
	} catch (err: any) {
		next(new Error(`Deposit credits failed.  ${err.message}`));
	}
};

export const logout: RequestHandler = async (req, res, next) => {
	const sessionId = req.userData?.sessionId;

	try {
		await Session.findOneAndDelete({ sessionId });

		res.status(200).json({
			message: "Closed current sessions successfully.",
		});
	} catch (err: any) {
		next(new Error(`Closing current sessions failed. ${err.message}`));
	}
};

export const logoutSessions: RequestHandler = async (req, res, next) => {
	const userId = req.userData?.userId;

	try {
		await Session.deleteMany({ userId });

		res.status(200).json({
			message: "Closed all sessions successfully.",
		});
	} catch (err: any) {
		next(new Error(`Closing all sessions failed. ${err.message}`));
	}
};
