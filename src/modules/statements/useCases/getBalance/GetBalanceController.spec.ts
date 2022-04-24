import { createConnection, Connection } from 'typeorm';
import { app } from '../../../../app';

import request from 'supertest';

let connection: Connection;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get the account balance", async () => {
    //cria o usuario e o auth token
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });
    const token = tokenResponse.body.token;

    //cria os statements para gerar o balance
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 400, description: "First Deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 150, description: "First Withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 150, description: "Second Withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(3);
    expect(response.body.balance).toEqual(100);
  });

  it("Should be able to get the account balance without any statement", async () => {
    //cria o usuario e o auth token
    await request(app).post('/api/v1/users').send({
      email: "user@test.com", name: "user", password: "1234"
    });
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: "user@test.com", password: "1234"
    });
    const token = tokenResponse.body.token;

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(0);
    expect(response.body.balance).toEqual(0);
  });

  it("Should not be able to get the balance without a invalid user token", async () => {
    const fakeUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYTcxYzc4MGUtNDRkMC00OTVmLTk1NmEtY2I4MDQ0NTVmNGNmIiwibmFtZSI6InVzZXIiLCJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJwYXNzd29yZCI6IiQyYSQwOCRXaWZYV2d5VEFDSnd2Y0MvamhPdGwuOUFlUnVnZnguSndWVFRiSGN1TVBqQ05ndHRFMWVxLiIsImNyZWF0ZWRfYXQiOiIyMDIyLTA0LTI0VDE1OjQ3OjU4LjU3MVoiLCJ1cGRhdGVkX2F0IjoiMjAyMi0wNC0yNFQxNTo0Nzo1OC41NzFaIn0sImlhdCI6MTY1MDgwNDUyNCwiZXhwIjoxNjUwODkwOTI0LCJzdWIiOiJhNzFjNzgwZS00NGQwLTQ5NWYtOTU2YS1jYjgwNDQ1NWY0Y2YifQ.-ESlkZ-VyGwt_Jkc0DRoKeP8v7uxkigQusKlbFZNV1c";
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${fakeUserToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('User not found');
  });
})
