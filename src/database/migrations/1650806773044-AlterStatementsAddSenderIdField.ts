import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AlterStatementsAddSenderIdField1650806773044 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("statements", new TableColumn({
      name: "sender_id",
      type: "uuid",
      isNullable: true
    }));

    await queryRunner.createForeignKey("statements", new TableForeignKey({
      name: "FKUserSenderStatements",
      referencedTableName: "users",
      referencedColumnNames: ["id"],
      columnNames: ["sender_id"],
      onDelete: "SET NULL",
      onUpdate: "SET NULL"
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('statements', 'FKUserSenderStatements');
    await queryRunner.dropColumn('statements', 'sender_id');
  }

}
