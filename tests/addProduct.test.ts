import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server";
import { expect } from "chai";
import { User } from "../models/user";
import { Product } from "../models/product";

chai.use(chaiHttp);

const mockToken_buyer =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2QzODQ5ZmZiZGI4YjYwYWU1YzIiLCJuYW1lIjoidGVzdF9idXllciIsInJvbGUiOiJidXllciIsImlhdCI6MTcwMDY0NjI5MH0.4oruN4UshTQPEzK0SxP_HryZSjLifVuUEfXtzQ1liM8";
const mockToken_seller =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2Q1YzQ5ZmZiZGI4YjYwYWU1YzUiLCJuYW1lIjoidGVzdF9zZWxsZXIiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzAwNjUyMDAyfQ.OAWGgYgs0dxJso5IwR7XIV_KraQaA3yIUdm31i7lSes";

describe("POST /products/add", () => {
	it("should add a product successfully for a valid seller", async () => {
		const seller = await User.findOne({ role: "seller" });

		if (!seller) {
			throw new Error("Seller not found in the database");
		}

		const productData = {
			cost: 20,
			amountAvailable: 50,
			productName: "Test Product",
		};

		const res = await chai
			.request(app)
			.post("/products/add")
			.set("Authorization", `Bearer ${mockToken_seller}`)
			.send(productData);

		// Assert using the custom type
		expect(res).to.have.status(201);
		expect(res.body.message).to.equal("Product added successfully!");

		// Check that the product has been added to the database
		const addedProduct = await Product.findOne({
			productName: "Test Product",
		});
		expect(addedProduct).to.exist;
		expect(addedProduct?.cost).to.equal(productData.cost);
		expect(addedProduct?.amountAvailable).to.equal(
			productData.amountAvailable
		);
		expect(addedProduct?.sellerId).to.equal(seller._id.toString());
	});

	it("should return an error for invalid inputs", async () => {
		const res = await chai
			.request(app)
			.post("/products/add")
			.set("Authorization", `Bearer ${mockToken_seller}`)
			.send({
				cost: -5,
				amountAvailable: "invalidAmount",
				productName: "",
			});

		// Assert using the custom type
		expect(res).to.have.status(500);
		expect(res.body.message).to.equal(
			"Invalid inputs passed, please check your data."
		);
	});

	it("should return an error for a buyer trying to add a product", async () => {
		const res = await chai
			.request(app)
			.post("/products/add")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({
				cost: 15,
				amountAvailable: 30,
				productName: "Test Product",
			});

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal(
			"You need to have a seller account to add products."
		);
	});

	it("should return an error for invalid cost value", async () => {
		const res = await chai
			.request(app)
			.post("/products/add")
			.set("Authorization", `Bearer ${mockToken_seller}`)
			.send({
				cost: 17,
				amountAvailable: 30,
				productName: "Test Product",
			});

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal(
			"The cost of product should be a multiple of 5."
		);
	});
});
