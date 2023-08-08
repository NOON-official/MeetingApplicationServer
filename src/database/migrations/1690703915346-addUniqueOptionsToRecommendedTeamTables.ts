import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addUniqueOptionsToRecommendedTeamTables1690703915346 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'recommended_team',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isUnique: true,
      }),
    );

    await queryRunner.changeColumn(
      'next_recommended_team',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'int',
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'next_recommended_team',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'int',
      }),
    );

    await queryRunner.changeColumn(
      'recommended_team',
      'userId',
      new TableColumn({
        name: 'userId',
        type: 'int',
      }),
    );
  }
}
