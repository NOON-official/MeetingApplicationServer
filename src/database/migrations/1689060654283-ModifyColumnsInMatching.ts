import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ModifyColumnsInMatching1689060654283 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'matching',
      'appliedTeamTicketId',
      new TableColumn({
        name: 'appliedTeamIsPaid',
        type: 'boolean',
        isNullable: true,
      }),
    );
    await queryRunner.changeColumn(
      'matching',
      'receivedTeamTicketId',
      new TableColumn({
        name: 'receivedTeamIsPaid',
        type: 'boolean',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'matching',
      'appliedTeamIsPaid',
      new TableColumn({
        name: 'appliedTeamTicketId',
        type: 'int',
        isNullable: true,
      }),
    );
    await queryRunner.changeColumn(
      'matching',
      'receivedTeamIsPaid',
      new TableColumn({
        name: 'receivedTeamTicketId',
        type: 'int',
        isNullable: true,
      }),
    );
  }
}
