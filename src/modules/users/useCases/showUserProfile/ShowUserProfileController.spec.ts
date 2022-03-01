import request from 'supertest';
import { app } from '../../../../app';
import { createConnection, Connection } from 'typeorm';

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show user profile", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });

    const authResponse = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com", password: "1234"
    });

    const userId = authResponse.body.user.id;
    const token = authResponse.body.token;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('admin');
    expect(response.body.email).toEqual('admin@test.com');
    expect(response.body.id).toEqual(userId);
  });

  it("Should not be able to show a user profile without Authorization token", async () => {
    //cria um usuario e autentica ele
    await request(app).post('/api/v1/users').send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const response = await request(app).get('/api/v1/profile').set({});

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('JWT token is missing!');
  });

  it("Should not be able to show a user profile with invalid Authorization token", async () => {
    //cria um usuario e autentica ele
    await request(app).post('/api/v1/users').send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const fakeToken = "eyJhbGciOiJIUaI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMWQ5N2RmY2QtYWY4ZS00OWY5LTkxNWEtYjE5MzNhZjNhNDgwIiwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JHluVXNhZUFtZzhwTUVuUnczeTNOL2U3eWxCSDgzZzhoNXQuaDdUSGIua2NtMGoudUNyVzFtIiwiY3JlYXRlZF9hdCI6IjIwMjItMDItMjdUMTY6MjA6NTMuOTQ3WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAyLTI3VDE2OjIwOjUzLjk0N1oifSwiaWF0IjoxNjQ2MDgzOTc3LCJleHAiOjE2NDYxNzAzNzcsInN1YiI6IjFkOTdkZmNkLWFmOGUtNDlmOS05MTVhLWIxOTMzYWYzYTQ4MCJ9.usXj26LlRCP7-PSNbkyaHt9xP3bbpNmfeUi8gztBBcw"

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${fakeToken}`
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it("Should not be able to show a user profile with does not existing user token", async () => {
    await request(app).post('/api/v1/users').send({
      name: "admin", email: "admin@test.com", password: "1234"
    });

    await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMWQ5N2RmY2QtYWY4ZS00OWY5LTkxNWEtYjE5MzNhZjNhNDgwIiwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JHluVXNhZUFtZzhwTUVuUnczeTNOL2U3eWxCSDgzZzhoNXQuaDdUSGIua2NtMGoudUNyVzFtIiwiY3JlYXRlZF9hdCI6IjIwMjItMDItMjdUMTY6MjA6NTMuOTQ3WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAyLTI3VDE2OjIwOjUzLjk0N1oifSwiaWF0IjoxNjQ2MDgzOTc3LCJleHAiOjE2NDYxNzAzNzcsInN1YiI6IjFkOTdkZmNkLWFmOGUtNDlmOS05MTVhLWIxOTMzYWYzYTQ4MCJ9.usXj26LlRCP7-PSNbkyaHt9xP3bbpNmfeUi8gztBBcw"

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${fakeToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User not found');
  });
})
