import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../../useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../useCases/authenticateUser/AuthenticateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

//uuid para gerar id falsa para teste
import { v4 as uuid } from 'uuid';
import { User } from '../../entities/User';
import { ShowUserProfileError } from './ShowUserProfileError';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to show user profile info", async () => {

    await createUserUseCase.execute({
      name: "admin",
      email: "admin@test.com",
      password: "1234"
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "admin@test.com",
      password: "1234"
    });

    const id = user.id ? user.id : uuid();

    const userProfile = await showUserProfileUseCase.execute(id);

    expect(userProfile).toBeInstanceOf(User);
    expect(userProfile.id).toEqual(id);
    expect(userProfile.name).toEqual("admin");
    expect(userProfile.email).toEqual("admin@test.com");
  });

  it("Should not be able to show user profile info with not exists id", async () => {
    expect(async () => {
      //cria um uuid inexistente
      const id = uuid();
      await showUserProfileUseCase.execute(id);

    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})
