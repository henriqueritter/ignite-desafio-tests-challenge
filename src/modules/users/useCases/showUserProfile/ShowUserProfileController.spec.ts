import request from 'supertest';
import { app } from '../../../../app';
import { createConnection, Connection } from 'typeorm';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../authenticateUser/AuthenticateUserUseCase';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';

let connection: Connection;


let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile Controller", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

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

    const expiredToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    //renova o token para expirar o antigo
    await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });


    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${expiredToken}`
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

    //gera token mockado
    await createUserUseCase.execute({
      email: "admin@test.com",
      name: "admin",
      password: "1234"
    });

    const { token: fakeUserToken } = await authenticateUserUseCase.execute({
      email: "admin@test.com",
      password: "1234"
    });


    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${fakeUserToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User not found');
  });
})
