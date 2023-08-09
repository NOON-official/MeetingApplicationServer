import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTeamEntity1686383414835 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('team_available_date');
    await queryRunner.dropColumns('team', [
      'prefSameUniversity',
      'startRound',
      'currentRound',
      'teamAvailableDate',
      'lastFailReason',
      'universities',
    ]);
    await queryRunner.addColumns('team', [
      new TableColumn({
        name: 'teamAvailableDate',
        type: 'int',
        default: 3,
      }),
      new TableColumn({
        name: 'teamName',
        type: 'varchar(255)',
      }),
      new TableColumn({
        name: 'memberCounts',
        type: 'json',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
