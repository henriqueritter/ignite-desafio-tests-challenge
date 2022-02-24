import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { AppError } from '../../../../shared/errors/AppError'

import { CreateUserUseCase } from './CreateUserUseCase'

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@email.com",
      password: "1234"
    })

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user.email).toEqual("test@email.com");
  });

  it("Should not be able to create a new user with existing email", async () => {
    expect(async () => {

      await createUserUseCase.execute({
        name: "test",
        email: "test@email.com",
        password: "1234"
      })

      await createUserUseCase.execute({
        name: "test",
        email: "test@email.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(AppError);
  });
})
