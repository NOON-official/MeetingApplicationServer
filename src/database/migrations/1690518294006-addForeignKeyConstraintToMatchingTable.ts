import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class addForeignKeyConstraintToMatchingTable1690518294006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'matching',
      new TableForeignKey({
        name: 'FK_appliedTeamId_teamId',
        columnNames: ['appliedTeamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'team',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'matching',
      new TableForeignKey({
        name: 'FK_receivedTeamId_teamId',
        columnNames: ['receivedTeamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'team',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE matching DROP CONSTRAINT FK_receivedTeamId_teamId');
    await queryRunner.query('ALTER TABLE matching DROP CONSTRAINT FK_appliedTeamId_teamId');
  }
}
