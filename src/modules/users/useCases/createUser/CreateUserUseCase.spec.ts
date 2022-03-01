import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'

import { CreateUserUseCase } from './CreateUserUseCase'
import { CreateUserError } from './CreateUserError';

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

import { ICreateUserDTO } from "../../dtos/ICreateUserDTO";

describe("Create User", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a new user", async () => {
    const userData: ICreateUserDTO = {
      name: "test",
      email: "test@email.com",
      password: "1234"
    };
    const user = await createUserUseCase.execute(userData);

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user.email).toEqual("test@email.com");
  });

  it("Should not be able to create a new user with existing email", async () => {
    //expect(async () => {

    await createUserUseCase.execute({
      name: "test",
      email: "test@email.com",
      password: "1234"
    });

    const response = await createUserUseCase.execute({
      name: "test",
      email: "test@email.com",
      password: "1234"
    });
    console.log(response);
    expect(response).toEqual("User already exists");
    //}).rejects.toBeInstanceOf(CreateUserError);
  });
});
