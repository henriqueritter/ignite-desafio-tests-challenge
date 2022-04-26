import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferStatementOperationError } from "./TransferStatementOperationError";
import { OperationType } from '../../dtos/IOperationTypeDTO'

interface IRequest {
  sender_id: string;
  recipient_id: string;
  amount: number;
  description: string;
  type: OperationType
}

@injectable()
class TransferStatementOperationUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ sender_id, recipient_id, amount, description, type }: IRequest): Promise<Statement> {
    //nao precisa validar o sender_id pois ele ja é verificado no authenticated user

    // verifica se o usuario que vai receber existe
    const recipientUser = await this.usersRepository.findById(recipient_id);


    if (!recipientUser) {
      throw new TransferStatementOperationError.RecipientUserNotFound();
    }


    //verifica se o usuario do sender_id e possui saldo em conta
    const { balance } = await this.statementsRepository.getUserBalance({ user_id: String(sender_id) });
    if (amount > balance) {
      throw new TransferStatementOperationError.InsufficientFunds();
    }

    //efetua a operacao de criar um statement do tipo transfer
    const statement = await this.statementsRepository.create({
      user_id: recipient_id,
      sender_id: String(sender_id),
      amount,
      description,
      type
    });

    return statement;
  }
}

export { TransferStatementOperationUseCase }
