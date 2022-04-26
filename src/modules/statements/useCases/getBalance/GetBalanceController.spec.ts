import { createConnection, Connection } from 'typeorm';
import { app } from '../../../../app';

import request from 'supertest';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';

let connection: Connection;

//para gerar um token falso mas no formato valido
let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;


describe("Get Balance Controller", () => {
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

  it("Should be able to get the updated account balance after a transfer statement", async () => {
    //cria o usuario e o auth token
    await request(app).post('/api/v1/users').send({
      email: "sender@test.com", name: "user", password: "1234"
    });

    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: "sender@test.com", password: "1234"
    });
    const token = tokenResponse.body.token;
    //realiza um deposito para ter saldo na conta
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 400, description: "First Deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    //cria o usuario que vai receber
    await request(app).post('/api/v1/users').send({
      email: "recipient@test.com", name: "user", password: "1234"
    });

    const recipientUserSessionResponse = await request(app).post('/api/v1/sessions').send({
      email: "recipient@test.com", password: "1234"
    });
    const { id: recipient_id } = recipientUserSessionResponse.body.user;

    //realiza a transferencia
    await request(app).post(`/api/v1/statements/transfers/${recipient_id}`).send({
      amount: 250,
      description: "Transfer to Test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    //pega o balance da conta e verifica se a transferencia  foi feita
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(2);
    expect(response.body.balance).toEqual(150);
  });

  it("Should not be able to get the balance without a invalid user token", async () => {
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

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${fakeUserToken}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('User not found');
  });
})
