import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("Shoud be able to authenticate a user", async () => {
    //create user login
    await createUserUseCase.execute({
      email: "admin@test.com",
      name: "admin",
      password: "1234"
    });

    const session = await authenticateUserUseCase.execute({
      email: "admin@test.com",
      password: "1234"
    });

    expect(session).toHaveProperty("token");
    expect(session).toHaveProperty("user");
  });

  it("Should not be able to authenticate a user with incorrect email", async () => {
    expect(async () => {


      //create user login
      await createUserUseCase.execute({
        email: "admin@test.com",
        name: "admin",
        password: "1234"
      });

      const session = await authenticateUserUseCase.execute({
        email: "incorrect@test.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user with incorrect password", async () => {
    expect(async () => {
      //create user login
      await createUserUseCase.execute({
        email: "admin@test.com",
        name: "admin",
        password: "1234"
      });

      const session = await authenticateUserUseCase.execute({
        email: "admin@test.com",
        password: "4321"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

})
