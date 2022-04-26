import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementView } from '../../views/GetStatementView';

export class GetStatementOperationController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { statement_id } = request.params;

    const getStatementOperation = container.resolve(GetStatementOperationUseCase);

    const statementOperation = await getStatementOperation.execute({
      user_id,
      statement_id
    });

    const statementOperationDTO = GetStatementView.toDTO({ statement: statementOperation });

    return response.json(statementOperationDTO);
  }
}
