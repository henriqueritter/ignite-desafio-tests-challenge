import { Request, Response } from 'express'
import { container } from 'tsyringe';
import { TransferStatementOperationUseCase } from './TransferStatementOperationUseCase';
class TransferStatementOperationController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { recipient_id } = request.params;
    const { amount, description } = request.body;

    const transferStatementOperationUseCase = container.resolve(TransferStatementOperationUseCase);

    const statement = await transferStatementOperationUseCase.execute({ sender_id, recipient_id, amount, description });

    return response.json(statement);
  }
}
export { TransferStatementOperationController }
