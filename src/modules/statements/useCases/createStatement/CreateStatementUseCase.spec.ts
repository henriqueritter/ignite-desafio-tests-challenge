import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';

import { v4 as uuid } from 'uuid';
import { Statement } from '../../entities/Statement';
import { CreateStatementError } from './CreateStatementError';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementeUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    createStatementeUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it("Should be able to create a new deposit statement", async () => {
    await createUserUseCase.execute({
      name: "admin",
      email: "admin@teste.com",
      password: "1234"
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "admin@teste.com",
      password: "1234"
    });

    const userId = user.id ? user.id : uuid();
    const typeDeposit = "deposit" as OperationType;

    const statement = await createStatementeUseCase.execute({
      user_id: userId,
      type: typeDeposit,
      amount: 125,
      description: "Test Deposit"
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement.amount).toEqual(125);
    expect(statement.description).toEqual("Test Deposit");
  });

  it("Should be able to create a new withdraw statement", async () => {
    await createUserUseCase.execute({
      name: "admin",
      email: "admin@teste.com",
      password: "1234"
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "admin@teste.com",
      password: "1234"
    });

    const userId = user.id ? user.id : uuid();

    //cria um deposito
    const typeDeposit = "deposit" as OperationType;
    await createStatementeUseCase.execute({
      user_id: userId,
      type: typeDeposit,
      amount: 125,
      description: "Test Deposit"
    });

    //realiza saque
    const typeWithDraw = "withdraw" as OperationType;
    const statement = await createStatementeUseCase.execute({
      user_id: userId,
      type: typeWithDraw,
      amount: 110,
      description: "Test WithDraw"
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement.type).toEqual("withdraw");
    expect(statement.amount).toEqual(110);
    expect(statement.description).toEqual("Test WithDraw");
  });

  it("Should not be able to create a new statement with a user wich does not exists", async () => {
    expect(async () => {
      const userId = uuid();
      const typeDeposit = "deposit" as OperationType;

      await createStatementeUseCase.execute({
        user_id: userId,
        type: typeDeposit,
        amount: 125,
        description: "Test Deposit"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a new withdraw with insufficient funds", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "admin",
        email: "admin@teste.com",
        password: "1234"
      });

      const { user } = await authenticateUserUseCase.execute({
        email: "admin@teste.com",
        password: "1234"
      });

      const userId = user.id ? user.id : uuid();

      //cria um deposito
      const typeDeposit = "deposit" as OperationType;
      await createStatementeUseCase.execute({
        user_id: userId,
        type: typeDeposit,
        amount: 125,
        description: "Test Deposit"
      });

      //realiza saque
      const typeWithDraw = "withdraw" as OperationType;
      await createStatementeUseCase.execute({
        user_id: userId,
        type: typeWithDraw,
        amount: 130,
        description: "Test WithDraw"
      });

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
})
