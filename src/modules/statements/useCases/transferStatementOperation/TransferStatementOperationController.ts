import { Request, Response } from 'express'
class TransferStatementOperationController {
  async handle(request: Request, response: Response): Promise<Response> {
    return response.send();
  }
}
export { TransferStatementOperationController }
