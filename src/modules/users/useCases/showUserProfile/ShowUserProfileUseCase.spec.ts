import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../../useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../useCases/authenticateUser/AuthenticateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  })
})
