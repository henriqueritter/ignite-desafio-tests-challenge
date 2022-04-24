import { app } from '../../../../app';
import { Connection, createConnection } from 'typeorm';
import request from 'supertest';

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new Deposit Statement", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });
    const userToken = responseToken.body.token;

    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 150, description: "First Deposit"
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body.amount).toEqual(150);
    expect(response.body.description).toEqual('First Deposit');
  });

  it("Should not be able to create a new Statement with invalid user token", async () => {
    const fakeUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZjI5MjMzYzAtMzdkNy00Mjk0LWEwYzUtYzUxNTBkNjM3NzZlIiwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JGFTbU9rY3JPOEYwTy9rVTdQUUFKRGVDNy9EbEpUYWpmR2VkckUwZUdXSUZnZEhiRFFpelo2IiwiY3JlYXRlZF9hdCI6IjIwMjItMDQtMjRUMTU6MzY6MzUuMzYyWiIsInVwZGF0ZWRfYXQiOiIyMDIyLTA0LTI0VDE1OjM2OjM1LjM2MloifSwiaWF0IjoxNjUwODAzNzk3LCJleHAiOjE2NTA4OTAxOTcsInN1YiI6ImYyOTIzM2MwLTM3ZDctNDI5NC1hMGM1LWM1MTUwZDYzNzc2ZSJ9.eBD6gQ2UuZkwU7tt12KwK6xwgm9XOQ-6sehFCLt__u4";

    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 150, description: "Fake Deposit"
    }).set({
      Authorization: `Bearer ${fakeUserToken}`
    });


    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('User not found');
  });

  it("Should not be able to create a new Statement without amount parameter", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", password: "1234", name: "admin"
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const userToken = responseToken.body.token;

    const response = await request(app).post('/api/v1/statements/deposit').send({
      description: "Statement withou amount"
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
  });

  it("Should not be able to create a new Statement without user Token", async () => {
    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100, description: "Statement withou user token"
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('JWT token is missing!');
  });

  //-------------withdraw-----------------
  it("Should be able to create a new WithDraw Statement", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const userToken = responseToken.body.token;

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 400, description: "new Deposit"
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 250, description: "First Withdraw"
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body.amount).toEqual(250);
    expect(response.body.description).toEqual('First Withdraw');
    expect(response.body.type).toEqual('withdraw');
  });

  it("Should not be able to do a withdraw without funds", async () => {
    await request(app).post('/api/v1/users').send({
      name: "userDeposit", email: "deposit@email.com", password: "deposit"
    });

    await request(app).post('/api/v1/users').send({
      name: "userWithdraw", email: "withdraw@email.com", password: "withdraw"
    });

    const responseTokenDeposit = await request(app).post('/api/v1/sessions').send({
      email: "deposit@email.com", password: "deposit"
    });

    const responseTokenWithdraw = await request(app).post('/api/v1/sessions').send({
      email: "withdraw@email.com", password: "withdraw"
    });

    const tokenDeposit = responseTokenDeposit.body.token;
    const tokenWithdraw = responseTokenWithdraw.body.token;

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 300, description: "Deposit from deposit email"
    }).set({
      Authorization: `Bearer ${tokenDeposit}`
    });

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 150, description: "Insufficient funds Withdraw"
    }).set({
      Authorization: `Bearer ${tokenWithdraw}`
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Insufficient funds');
  });

})
