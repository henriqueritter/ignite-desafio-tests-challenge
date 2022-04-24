import { injectable } from "tsyringe";


interface IRequest {
  recipient_id: string;
  sender_id: String;
  amount: number;
  description: string;

}
@injectable()
class TransferStatementOperationController {
  constructor() { }
  async execute() { }
}

export { TransferStatementOperationController }
