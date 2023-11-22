import { Router } from "express";
import { check } from "express-validator";

import { checkAuth, checkSession } from "../middleware/check-auth";
import {
	getProducts,
	addProduct,
	updateProduct,
	deleteProduct,
	buyProduct,
} from "../controllers/products-controller";

const router = Router();

// Get Products
router.get("/", getProducts);

// Check if authenticated
router.use(checkAuth);
router.use(checkSession);

// Add Product
router.post(
	"/add",
	[
		check("amountAvailable").not().isEmpty().isNumeric(),
		check("cost").not().isEmpty().isNumeric(),
		check("productName").isString().isLength({ min: 3 }),
	],
	addProduct
);

// Update Existing Product
router.patch(
	"/update/:productId",
	[
		check("amountAvailable").optional().isNumeric(),
		check("cost").optional().isNumeric(),
		check("productName").optional().isString().isLength({ min: 3 }),
	],
	updateProduct
);

// Delete product
router.delete("/delete/:productId", deleteProduct);

// Buy Product
router.post(
	"/buy",
	[
		check("productId").notEmpty(),
		check("amount").not().isEmpty().isFloat({ min: 1 }),
	],
	buyProduct
);

export default router;
