import request from 'supertest';

import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com", password: "1234"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  it("Should not be able to authenticate a user with wrong password", async () => {
    await request(app).post('/api/v1/users').send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'admin@test.com', password: 'wrongPass'
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Incorrect email or password');
  });

  it("Should not be able to authenticate a user which does not exists", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'admin@test.com', password: 'wrongPass'
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Incorrect email or password');
  });

})
