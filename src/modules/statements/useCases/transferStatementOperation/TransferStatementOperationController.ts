import { Request, Response } from 'express'
import { container } from 'tsyringe';
import { TransferStatementOperationUseCase } from './TransferStatementOperationUseCase';

import { OperationType } from '../../dtos/IOperationTypeDTO';
class TransferStatementOperationController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { recipient_id } = request.params;
    const { amount, description } = request.body;
    const type = 'transfer' as OperationType;

    const transferStatementOperationUseCase = container.resolve(TransferStatementOperationUseCase);

    const statement = await transferStatementOperationUseCase.execute({ sender_id, recipient_id, amount, description, type });

    return response.status(201).json(statement);
  }
}
export { TransferStatementOperationController }
