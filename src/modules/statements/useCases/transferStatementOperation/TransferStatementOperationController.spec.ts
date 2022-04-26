import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

describe("Transfer Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    //cria usuario sender
    await request(app).post('/api/v1/users').send({
      email: 'sender@test.com', name: 'sender', password: '12345'
    });

    //cria usuario recipient
    await request(app).post('/api/v1/users').send({
      email: 'recipient@test.com', name: 'recipient', password: '12345'
    });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  //cenario 1: criar uma transferencia
  it("should be able to create a new transfer between two users", async () => {

    //recupera o id do recipient
    const responseSessionRecipient = await request(app).post('/api/v1/sessions').send({
      email: 'sender@test.com', password: '12345'
    });

    const { id: recipient_id } = responseSessionRecipient.body.user;

    //login/geratoken usuario sender
    const responseSessionSender = await request(app).post('/api/v1/sessions').send({
      email: 'sender@test.com', password: '12345'
    });

    const { token } = responseSessionSender.body;

    //faz deposito no sender
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 200,
      description: 'Deposit Test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    //faz transferencia do sender para o recipient
    const responseTransfer = await request(app).post(`/api/v1/statements/transfers/${recipient_id}`).send({
      amount: 100,
      description: 'Test Transfer'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(responseTransfer.status).toBe(201);
  });

  //cenario 2: erro 404 recipient not found
  it("should not be able to create a transfer with a user which does not exists.", async () => {
    //login/geratoken usuario sender
    const responseSessionSender = await request(app).post('/api/v1/sessions').send({
      email: 'sender@test.com', password: '12345'
    });

    const { token } = responseSessionSender.body;

    const fakeRecipient_id = uuidV4();

    //faz transferencia do sender para o recipient
    const responseTransfer = await request(app).post(`/api/v1/statements/transfers/${fakeRecipient_id}`).send({
      amount: 100,
      description: 'Test Transfer'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(responseTransfer.status).toBe(404);
    expect(responseTransfer.body).toHaveProperty('message');
    expect(responseTransfer.body.message).toEqual('Recipient User not found');
  });

  //cenario 3: erro 400 insufficient funds
  it("should not be able to create a transfer when the funds are insufficient.", async () => {
    //login/geratoken usuario sender
    const responseSessionSender = await request(app).post('/api/v1/sessions').send({
      email: 'sender@test.com', password: '12345'
    });

    const { token } = responseSessionSender.body;

    //recupera o id do recipient
    const responseSessionRecipient = await request(app).post('/api/v1/sessions').send({
      email: 'recipient@test.com', password: '12345'
    });

    const { id: recipient_id } = responseSessionRecipient.body.user;

    //faz transferencia do sender para o recipient
    const responseTransfer = await request(app).post(`/api/v1/statements/transfers/${recipient_id}`).send({
      amount: 500,
      description: 'Test Transfer'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(responseTransfer.status).toBe(400);
    expect(responseTransfer.body).toHaveProperty('message');
    expect(responseTransfer.body.message).toEqual('Insufficient funds');
  });
  //cenario 4: getbalance?
})
