import { createConnection, Connection } from 'typeorm';
import { app } from '../../../../app';
import request from 'supertest';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

let connection: Connection;

//para gerar um token falso mas no formato valido
let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;


describe("Get Statement Controller", () => {
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

  it("Should be able to get a statement by id", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });

    const userToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const token = userToken.body.token;

    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 300.00, description: "Deposit Statement"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const { id, description, type, created_at, updated_at } = responseStatement.body;

    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.id).toEqual(id);
    expect(response.body.amount).toEqual('300.00');
    expect(response.body.description).toEqual(description);
    expect(response.body.type).toEqual(type);
    expect(response.body.created_at).toEqual(created_at);
    expect(response.body.updated_at).toEqual(updated_at);
  });

  it("Shoud not be able to get a statement with another user", async () => {
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });
    await request(app).post('/api/v1/users').send({
      email: "user@test.com", name: "user", password: "1234"
    });

    const adminResponseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });
    const userResponseToken = await request(app).post('/api/v1/sessions').send({
      email: "user@test.com", password: "1234"
    });

    const adminToken = adminResponseToken.body.token;
    const userToken = userResponseToken.body.token;

    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 150, description: "Deposit Statement"
    }).set({
      Authorization: `Bearer ${adminToken}`
    });

    const { id } = responseStatement.body;

    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Statement not found');
  });

  it("Should not be able to get a statement with invalid token", async () => {
    //cria usuario para gerar um statment e ter um id valido
    await request(app).post('/api/v1/users').send({
      email: "admin@test.com", name: "admin", password: "1234"
    });

    const adminResponseToken = await request(app).post('/api/v1/sessions').send({
      email: "admin@test.com", password: "1234"
    });

    const adminToken = adminResponseToken.body.token;

    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 350, description: "Deposit Statement"
    }).set({
      Authorization: `Bearer ${adminToken}`
    });

    const { id } = responseStatement.body;

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

    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${fakeUserToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("User not found");
  })
})
