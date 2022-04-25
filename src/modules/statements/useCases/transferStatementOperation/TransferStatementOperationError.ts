import { AppError } from '../../../../shared/errors/AppError'

export namespace TransferStatementOperationError {
  export class RecipientUserNotFound extends AppError {
    constructor() {
      super("Recipient User not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
