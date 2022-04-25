import { injectable } from "tsyringe";
import { Statement } from "../../entities/Statement";


interface IRequest {
  sender_id: String;
  recipient_id: string;
  amount: number;
  description: string;
}

@injectable()
class TransferStatementOperationUseCase {
  constructor() { }
  async execute({ sender_id, recipient_id, amount, description }: IRequest): Promise<Statement> {
    const statement = new Statement();
    return statement;
  }
}

export { TransferStatementOperationUseCase }
