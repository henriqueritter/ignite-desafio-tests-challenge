import { v4 as uuid } from 'uuid';

import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';

import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

import { GetStatementOperationError } from './GetStatementOperationError';
import { Statement } from '../../entities/Statement';

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

import { OperationType } from '../../dtos/IOperationTypeDTO';

describe("Statement Operation", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
  });


  it("Should be able to list one statement by Id", async () => {
    await createUserUseCase.execute({ name: "admin", email: "admin@test.com", password: "1234" });
    //trocar pelo repositorio
    const { user } = await authenticateUserUseCase.execute({ email: "admin@test.com", password: "1234" });

    const userId = user.id ? user.id : uuid();

    const { id } = await createStatementUseCase.execute({
      user_id: userId,
      amount: 250,
      description: "First Statement",
      type: "deposit" as OperationType
    });

    const statementId = id ? id : uuid();

    const statementOperation = await getStatementOperationUseCase.execute({ user_id: userId, statement_id: statementId });

    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation.amount).toEqual(250);
  });


  it("Should not be able to list a statement with a non existing user id", async () => {

    await createUserUseCase.execute({ name: "admin", email: "admin@test.com", password: "1234" });

    const { user } = await authenticateUserUseCase.execute({ email: "admin@test.com", password: "1234" });

    const userId = user.id ? user.id : uuid();

    const { id } = await createStatementUseCase.execute({
      user_id: userId,
      amount: 250,
      description: "First Statement",
      type: "deposit" as OperationType
    });

    const statementId = id ? id : uuid();

    //non existing user Id
    const fakeUserId = uuid();

    await expect(getStatementOperationUseCase.execute({ user_id: fakeUserId, statement_id: statementId })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });


  it("Should not be able to list a statement with incorrect statement id", async () => {

    await createUserUseCase.execute({ name: "admin", email: "admin@email.com", password: "1234" });

    const { user } = await authenticateUserUseCase.execute({ email: "admin@email.com", password: "1234" });

    const userId = user.id ? user.id : uuid();

    await createStatementUseCase.execute({
      user_id: userId,
      type: "deposit" as OperationType,
      description: "First Deposit",
      amount: 100
    });

    const fakeStatementId = uuid();

    await expect(getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: fakeStatementId
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

})
