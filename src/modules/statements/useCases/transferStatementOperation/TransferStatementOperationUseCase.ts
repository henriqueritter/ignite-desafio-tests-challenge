import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";


interface IRequest {
  sender_id: String;
  recipient_id: string;
  amount: number;
  description: string;
}

@injectable()
class TransferStatementOperationUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ sender_id, recipient_id, amount, description }: IRequest): Promise<Statement> {
    //verifica se o usuario que quer enviar existe
    //nao precisa pois ele ja é verificado no authenticated user

    // verifica se o usuario que vai receber existe
    const recipientUser = await this.usersRepository.findById(recipient_id);
    //verifica se o usuario e possui saldo em conta


    //efetua a operacao de criar um statement do tipo transfer


    const statement = new Statement();
    return statement;
  }
}

export { TransferStatementOperationUseCase }
