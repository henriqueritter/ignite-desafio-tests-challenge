import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';
import request from 'supertest';

let connection: Connection;

describe("Transfer Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  //cenario 1: criar uma transferencia
  it("should be able to create a new transfer between two users", async () => {
    //cria usuario sender
    await request(app).post('/api/v1/users').send({
      email: 'sender@test.com', name: 'sender', password: '12345'
    });

    //cria usuario recipient
    const responseRecipient = await request(app).post('/api/v1/users').send({
      email: 'recipient@test.com', name: 'recipient', password: '12345'
    });

    const { recipient_id } = responseRecipient.body;

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

  //cenario 3: erro 400 insufficient funds

  //cenario 4: getbalance?
})
