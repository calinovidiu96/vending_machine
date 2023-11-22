import { Router } from "express";
import { check } from "express-validator";

import { checkAuth } from "../middleware/check-auth";
import { signup, login, deposit, reset } from "../controllers/users-controller";

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

// Deposit credits
router.post("/deposit", [check("amount").isIn([5, 10, 20, 50, 100])], deposit);

// Reset deposit
router.get("/reset", reset);

export default router;
