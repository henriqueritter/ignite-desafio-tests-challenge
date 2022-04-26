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
export class BalanceMap {
  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {
    /*const parsedStatement = statement.map(({
      id,
      sender_id,
      amount,
      description,
      type,
      created_at,
      updated_at

    }) => (
      {
        id,
        sender_id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at,
      }
    ));*/
    const parsedStatement = statement.map(st => {
      const stat = {
        id: st.id,
        amount: Number(st.amount),
        description: st.description,
        type: st.type,
        created_at: st.created_at,
        updated_at: st.updated_at,
      }
      if (st.sender_id) {
        Object.assign(stat, {
          sender_id: st.sender_id
        });
      }
      return stat;
    })

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
