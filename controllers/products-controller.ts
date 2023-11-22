import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

import { User } from "../models/user";
import { Product } from "../models/product";

interface ProductUpdate {
	amountAvailable?: number;
	cost?: number;
	productName?: string;
}

export const getProducts: RequestHandler = async (req, res, next) => {
	try {
		const products = await Product.find();

		if (!products) {
			return res
				.status(404)
				.json({ message: "There are no products available." });
		}

		res.status(200).json({
			message: "Products requested successfully!",
			products,
		});
	} catch (err: any) {
		next(new Error(`Getting products failed. ${err.message}`));
	}
};

export const addProduct: RequestHandler = async (req, res, next) => {
	const { cost, amountAvailable, productName } = req.body;
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
			return res.status(404).json({ message: "User not found." });
		}

		if (user.role === "buyer") {
			return res.status(400).json({
				message: "You need to have a seller account to add products.",
			});
		}

		if (cost < 0 || cost % 5 !== 0) {
			return res.status(400).json({
				message: "The cost of product should be a multiple of 5.",
			});
		}

		const newProduct = new Product({
			amountAvailable,
			cost,
			productName,
			sellerId: user._id,
		});

		await newProduct.save();

		res.status(201).json({
			message: "Product added successfully!",
		});
	} catch (err: any) {
		next(new Error(`Add product failed.  ${err.message}`));
	}
};

export const updateProduct: RequestHandler = async (req, res, next) => {
	const userId = req.userData?.userId;
	const { productId } = req.params;
	const { amountAvailable, cost, productName } = req.body;

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(500).json({
				message: "Invalid inputs passed, please check your data.",
			});
		}

		const product = await Product.findById(productId);

		if (!product) {
			return res
				.status(404)
				.json({ message: "Can't find this product." });
		}

		if (product.sellerId !== userId) {
			return res.status(400).json({
				message: "This product can be updated just by its owner.",
			});
		}

		if (cost && (cost < 0 || cost % 5 !== 0)) {
			return res.status(400).json({
				message: "The cost of product should be a multiple of 5.",
			});
		}

		const update: ProductUpdate = {
			amountAvailable: amountAvailable ?? undefined,
			cost: cost ?? undefined,
			productName: productName ?? undefined,
		};

		await Product.findOneAndUpdate({ _id: productId }, update);

		res.status(201).json({
			message: "Product updated successfully!",
		});
	} catch (err: any) {
		next(new Error(`Update product failed.  ${err.message}`));
	}
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
	const userId = req.userData?.userId;
	const { productId } = req.params;

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res
				.status(404)
				.json({ message: "Can't find this product." });
		}

		if (product.sellerId !== userId) {
			return res.status(400).json({
				message: "This product can be deleted just by its owner.",
			});
		}

		await Product.findByIdAndDelete(productId);

		res.status(201).json({
			message: "Product deleted successfully!",
		});
	} catch (err: any) {
		next(new Error(`Delete product failed.  ${err.message}`));
	}
};

export const buyProduct: RequestHandler = async (req, res, next) => {
	const userId = req.userData?.userId;
	const { productId, amount } = req.body;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(500).json({
				message: "Invalid inputs passed, please check your data.",
			});
		}

		let user = await User.findById(userId).session(session);

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		if (user.role === "seller") {
			return res.status(400).json({
				message: "You need to have a buyer account to buy products.",
			});
		}

		const product = await Product.findById(productId).session(session);

		if (!product) {
			return res
				.status(404)
				.json({ message: "Can't find this product." });
		}

		if (amount > product.amountAvailable) {
			return res.status(400).json({ message: "Insufficient stock." });
		}

		if (amount * product.cost > user.deposit) {
			return res
				.status(400)
				.json({ message: "Insufficient credit. Please deposit more." });
		}

		// Update the buyer new deposit
		user = await User.findByIdAndUpdate(
			userId,
			{
				deposit: user.deposit - amount * product.cost,
			},
			{
				new: true,
				session,
			}
		);

		//Update the seller new deposit
		const seller = await User.findById(product.sellerId).session(session);

		await User.findByIdAndUpdate(seller?._id, {
			deposit: seller!.deposit + amount * product.cost,
		}).session(session);

		// Update product amount available
		await Product.findByIdAndUpdate(productId, {
			amountAvailable: product.amountAvailable - amount,
		}).session(session);

		function calculateChange(changeAmount: number): number[] {
			const changeValues: number[] = [100, 50, 20, 10, 5];

			const result: number[] = [];

			// Iterate through each change value
			for (const changeValue of changeValues) {
				const count: number = Math.floor(
					changeAmount / (changeValue as number)
				);

				// Add the current change value to the result array count times
				for (let i = 0; i < count; i++) {
					result.push(changeValue);
				}

				// Update the changeAmount for the next iteration
				changeAmount %= changeValue;
			}

			return result;
		}

		const toReturn = {
			totalSpent: amount * product.cost,
			productPurchased: product.productName,
			change: calculateChange(user!.deposit),
		};

		await session.commitTransaction();

		res.status(201).json({
			message: "Product bought successfully!",
			response: toReturn,
		});
	} catch (err: any) {
		next(new Error(`Buy product failed.  ${err.message}`));
	} finally {
		session.endSession();
	}
};
