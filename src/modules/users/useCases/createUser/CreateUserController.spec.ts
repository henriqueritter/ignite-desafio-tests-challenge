import request from 'supertest';

import { app } from '../../../../app';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("Should be able to create a new user", async () => {
    const response = await request(app).post('/api/v1/users')
      .send({ name: "admin", email: "admin@test.com", password: "1234" });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a user with an email which already exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("User already exists");
  });

  it("Should be able to create a new user with a new email address", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user", email: "user@test.com", password: "1234"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "new user", email: "new.user@test.com", password: "1234"
    });

    expect(response.status).toBe(201);
  })
})
