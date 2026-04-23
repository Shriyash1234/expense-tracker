import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

import { createApp } from "../src/app";
import { connectToDatabase, disconnectFromDatabase } from "../src/db";
import { ExpenseModel } from "../src/models/Expense";

describe("expenses API", () => {
  const app = createApp();
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectToDatabase(mongoServer.getUri(), "expense-tracker-test");
  });

  beforeEach(async () => {
    await ExpenseModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
  });

  it("creates an expense and returns 201", async () => {
    const response = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-1")
      .send({
        amount: "123.45",
        category: "Food",
        description: "Lunch",
        date: "2026-04-23",
      });

    expect(response.status).toBe(201);
    expect(response.body.item.amount).toBe("123.45");
    expect(response.body.replayed).toBe(false);
  });

  it("replays the same request for the same idempotency key", async () => {
    const payload = {
      amount: "88.00",
      category: "Travel",
      description: "Cab fare",
      date: "2026-04-22",
    };

    const firstResponse = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-2")
      .send(payload);

    const secondResponse = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-2")
      .send(payload);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.item.id).toBe(firstResponse.body.item.id);
    expect(secondResponse.body.replayed).toBe(true);
    expect(await ExpenseModel.countDocuments()).toBe(1);
  });

  it("rejects reusing an idempotency key for another payload", async () => {
    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-3")
      .send({
        amount: "10.00",
        category: "Bills",
        description: "Internet",
        date: "2026-04-20",
      });

    const response = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-3")
      .send({
        amount: "25.00",
        category: "Bills",
        description: "Electricity",
        date: "2026-04-21",
      });

    expect(response.status).toBe(409);
  });

  it("lists expenses filtered by category in newest-first order", async () => {
    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-4")
      .send({
        amount: "50.00",
        category: "Food",
        description: "Dinner",
        date: "2026-04-20",
      });

    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-5")
      .send({
        amount: "75.00",
        category: "Food",
        description: "Groceries",
        date: "2026-04-22",
      });

    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "expense-6")
      .send({
        amount: "100.00",
        category: "Travel",
        description: "Fuel",
        date: "2026-04-21",
      });

    const response = await request(app).get("/expenses").query({
      category: "Food",
      sort: "date_desc",
    });

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].description).toBe("Groceries");
    expect(response.body.items[1].description).toBe("Dinner");
  });
});
