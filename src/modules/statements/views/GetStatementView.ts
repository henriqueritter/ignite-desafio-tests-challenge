import { Statement } from "../entities/Statement";

interface IBalanceMap {
  id: string;
  sender_id?: string;
  amount: Number;
  description: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}
export class GetStatementView {
  static toDTO({ statement }: { statement: Statement }) {

    const parsedStatement: IBalanceMap = {
      id: statement.id || "null",
      amount: Number(statement.amount),
      description: statement.description,
      type: statement.type,
      created_at: statement.created_at,
      updated_at: statement.updated_at,
    };

    if (statement.sender_id) {
      Object.assign(parsedStatement, {
        sender_id: statement.sender_id
      });
    };

    return parsedStatement;
  }
}
