import chai from "chai";
import chaiHttp from "chai-http";
import app from "../server";
import { expect } from "chai";
import { User } from "../models/user";

chai.use(chaiHttp);

const mockToken_buyer =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2QzODQ5ZmZiZGI4YjYwYWU1YzIiLCJuYW1lIjoidGVzdF9idXllciIsInJvbGUiOiJidXllciIsImlhdCI6MTcwMDY0NjI5MH0.4oruN4UshTQPEzK0SxP_HryZSjLifVuUEfXtzQ1liM8";
const mockToken_seller =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTVkY2Q1YzQ5ZmZiZGI4YjYwYWU1YzUiLCJuYW1lIjoidGVzdF9zZWxsZXIiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzAwNjQ2NDYzfQ.kUSQ_YTwBrRUApwq_6DbRw4OQXyeIwmdvMxNb6oWw9c";
const mockToken_invalid =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTViOThhNmY3MzgyMDE2NWRhYWM0MDQiLCJuYW1lIjoiT3ZpZGl1Iiwicm9sZSI6ImJ1eWVyIiwiaWF0IjoxNzAwNTIwMjYzfQ.8C0Hc9ENKG0Mke_oxltPzCUS6nAg0JelT4wTC1zKHXw";

describe("POST /user/deposit", () => {
	it("should deposit credits for a valid user", async () => {
		const test_buyer = await User.findOne({ username: "test_buyer" });

		if (!test_buyer) {
			throw new Error("Test user not found in the database");
		}

		const res = await chai
			.request(app)
			.post("/user/deposit")
			.send({ amount: 100 })
			.set("Authorization", `Bearer ${mockToken_buyer}`);

		// Assert using the custom type
		expect(res).to.have.status(200);
		expect(res.body.message).to.equal("Deposit updated successfully");
		expect(res.body.newDeposit).to.equal(test_buyer.deposit + 100);
	});

	it("should return an error for invalid inputs", async () => {
		const res = await chai
			.request(app)
			.post("/user/deposit")
			.set("Authorization", `Bearer ${mockToken_buyer}`)
			.send({ amount: "invalidAmount" });

		// Assert using the custom type
		expect(res).to.have.status(500);
		expect(res.body.message).to.equal(
			"Invalid inputs passed, please check your data."
		);
	});

	it("should return an error for a user not found", async () => {
		const res = await chai
			.request(app)
			.post("/user/deposit")
			.send({ amount: 100 })
			.set("Authorization", `Bearer ${mockToken_invalid}`);

		// Assert using the custom type
		expect(res).to.have.status(404);
		expect(res.body.message).to.equal("User not found");
	});

	it("should return an error for a seller trying to deposit credits", async () => {
		const res = await chai
			.request(app)
			.post("/user/deposit")
			.send({ amount: 100 })
			.set("Authorization", `Bearer ${mockToken_seller}`);

		// Assert using the custom type
		expect(res).to.have.status(400);
		expect(res.body.message).to.equal(
			"You can't deposit credits as a seller."
		);
	});
});
