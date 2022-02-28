import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase'
import { CreateStatementUseCase } from '../../useCases/createStatement/CreateStatementUseCase'
import { GetBalanceUseCase } from './GetBalanceUseCase';

import { v4 as uuid } from 'uuid'
import { GetBalanceError } from './GetBalanceError';

//cria variaveis para os useCases e repositorios
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {
  beforeEach(async () => {
    //process.env = Object.assign(process.env, { JWT_SECRET: 'senhasupersecreta123' });
    //cria instancia dos repositorios
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    //cria instancias dos useCases com a injecao dos repositorios
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("Should be able to get the balance", async () => {
    //cria usuario
    await createUserUseCase.execute({
      email: "admin@test.com",
      password: "1234",
      name: "admin"
    });
    //cria sessao para o usuario
    const { user } = await authenticateUserUseCase.execute({
      email: "admin@test.com",
      password: "1234"
    });

    const userId = user.id ? user.id : uuid();

    const typeDeposit = "deposit" as OperationType;
    const typeWithDraw = "withdraw" as OperationType;

    await createStatementUseCase.execute({
      amount: 200,
      description: "First Deposit",
      type: typeDeposit,
      user_id: userId
    });
    await createStatementUseCase.execute({
      amount: 150,
      description: "Second Deposit",
      type: typeDeposit,
      user_id: userId
    });
    await createStatementUseCase.execute({
      amount: 300,
      description: "First WithDraw",
      type: typeWithDraw,
      user_id: userId
    });

    const balance = await getBalanceUseCase.execute({ user_id: userId });

    expect(balance.balance).toEqual(50);
    expect(balance.statement).toHaveLength(3);
  });

  it("Should not be able to get balance with user which does not exists", () => {
    expect(async () => {
      const userId = uuid();

      await getBalanceUseCase.execute({ user_id: userId });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})
