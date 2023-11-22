import { Router } from "express";
import { check } from "express-validator";

import { checkAuth, checkSession } from "../middleware/check-auth";
import {
	signup,
	login,
	deposit,
	reset,
	logout,
	logoutSessions,
} from "../controllers/users-controller";

const router = Router();

// Signup
router.post(
	"/signup",
	[
		check("username").notEmpty(),
		check("password").isString().isLength({ min: 6 }),
		check("role").isIn(["buyer", "seller"]),
	],
	signup
);

// Login
router.post(
	"/login",
	[
		check("username").notEmpty(),
		check("password").isString().isLength({ min: 6 }),
	],
	login
);

// Check if authenticated
router.use(checkAuth);
router.use(checkSession);

// Deposit credits
router.post("/deposit", [check("amount").isIn([5, 10, 20, 50, 100])], deposit);

// Reset deposit
router.get("/reset", reset);

// Close current user sessions
router.get("/logout", logout);

// Close all user sessions
router.get("/logout/all", logoutSessions);

export default router;
