import { Schema, model } from "mongoose";

interface IProduct {
	amountAvailable: number;
	cost: number;
	productName: string;
	sellerId: string;
}

const productSchema = new Schema<IProduct>({
	amountAvailable: { type: Number, required: true },
	cost: {
		type: Number,
		required: true,
		validate: {
			validator: function (value: number) {
				// Check if the value is a positive number and a multiple of 5
				return value >= 0 && value % 5 === 0;
			},
			message: "Cost must be a positive number and a multiple of 5.",
		},
	},
	productName: { type: String, required: true, minlength: 3 },
	sellerId: { type: String, required: true },
});

export const Product = model<IProduct>("Product", productSchema);
