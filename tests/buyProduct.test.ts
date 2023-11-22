import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server";
import { expect } from "chai";
import { Product } from "../models/product";
import { User } from "../models/user";

chai.use(chaiHttp);

const mockToken_buyer =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2QzODQ5ZmZiZGI4YjYwYWU1YzIiLCJuYW1lIjoidGVzdF9idXllciIsInJvbGUiOiJidXllciIsImlhdCI6MTcwMDY0NjI5MH0.4oruN4UshTQPEzK0SxP_HryZSjLifVuUEfXtzQ1liM8";
const mockToken_seller =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2Q1YzQ5ZmZiZGI4YjYwYWU1YzUiLCJuYW1lIjoidGVzdF9zZWxsZXIiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzAwNjUyMDAyfQ.OAWGgYgs0dxJso5IwR7XIV_KraQaA3yIUdm31i7lSes";
const mockToken_invalid =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTViOThhNmY3MzgyMDE2NWRhYWM0MDQiLCJuYW1lIjoiT3ZpZGl1Iiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzAwNTIwMjYzfQ.8C0Hc9ENKG0Mke_oxltPzCUS6nAg0JelT4wTC1zKHXw";
const mockToken_lowDeposit =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkZmI3NzY2ZWJhNWNmNGVjNTc0ZDAiLCJuYW1lIjoidGVzdF91c2VyX2xvd19kZXBvc2l0Iiwicm9sZSI6InNlbGxlciIsImlhdCI6MTcwMDY1ODAzOX0.MN7QVZDu1ptUEEiRRBoDgoOcS2hi2ZyfClYblglbY7g";

describe("POST /products/buy", () => {
	it("should buy a product successfully for a valid buyer", async () => {
		const testProduct = await Product.findOne();

		if (!testProduct) {
			throw new Error("Test product not found in the database");
		}

		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ productId: testProduct._id, amount: 1 });

		// Assert using the custom type
		expect(res).to.have.status(201);
		expect(res.body.message).to.equal("Product bought successfully!");
	});

	it("should return an error for invalid inputs", async () => {
		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ productId: "invalidProductId", amount: "invalidAmount" });

		// Assert using the custom type
		expect(res).to.have.status(500);
		expect(res.body.message).to.equal(
			"Invalid inputs passed, please check your data."
		);
	});

	it("should return an error for a user not found", async () => {
		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_invalid}`)
			.send({ productId: "validProductId", amount: 1 });

		// Assert using the custom type
		expect(res).to.have.status(404);
		expect(res.body.message).to.equal("User not found.");
	});

	it("should return an error for a seller trying to buy a product", async () => {
		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_seller}`)
			.send({ productId: "validProductId", amount: 1 });

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal(
			"You need to have a buyer account to buy products."
		);
	});

	it("should return an error for insufficient stock", async () => {
		const testProduct = await Product.findOne();

		if (!testProduct) {
			throw new Error("Test product not found in the database");
		}

		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ productId: testProduct._id, amount: 999999 });

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal("Insufficient stock.");
	});

	it("should return an error for insufficient credit", async () => {
		const testProduct = await Product.findOne();

		if (!testProduct) {
			throw new Error("Test product not found in the database");
		}

		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_lowDeposit}`)
			.send({ productId: testProduct._id, amount: 1 });

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal(
			"Insufficient credit. Please deposit more."
		);
	});

	it("should update user and seller deposit correctly", async () => {
		const testProduct = await Product.findOne();

		if (!testProduct) {
			throw new Error("Test product not found in the database");
		}

		const buyerBefore = await User.findOne({ username: "test_buyer" });
		const sellerBefore = await User.findOne({ username: "test_seller" });

		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ productId: testProduct._id, amount: 1 });

		const buyerAfter = await User.findOne({ username: "test_buyer" });
		const sellerAfter = await User.findOne({ username: "test_seller" });

		// Assert using the custom type
		expect(res).to.have.status(201);
		expect(res.body.message).to.equal("Product bought successfully!");

		// Check that the buyer's deposit has been updated correctly
		expect(buyerAfter!.deposit).to.equal(
			buyerBefore!.deposit - testProduct.cost
		);

		// Check that the seller's deposit has been updated correctly
		expect(sellerAfter!.deposit).to.equal(
			sellerBefore!.deposit + testProduct.cost
		);
	});

	it("should update product stock correctly", async () => {
		const testProduct = await Product.findOne();

		if (!testProduct) {
			throw new Error("Test product not found in the database");
		}

		const productBefore = await Product.findOne({ _id: testProduct._id });

		const res = await chai
			.request(app)
			.post("/products/buy")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ productId: testProduct._id, amount: 1 });

		const productAfter = await Product.findOne({ _id: testProduct._id });

		// Assert using the custom type
		expect(res).to.have.status(201);
		expect(res.body.message).to.equal("Product bought successfully!");

		// Check that the product's stock has been updated correctly
		expect(productAfter!.amountAvailable).to.equal(
			productBefore!.amountAvailable - 1
		);
	});
});
