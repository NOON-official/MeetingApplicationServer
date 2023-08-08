import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class deleteDefaultUpdatedAtOptionInNextRecommendedTeamTable1690546765621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'next_recommended_team',
      'updatedAt',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp(6)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'next_recommended_team',
      'updatedAt',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp(6)',
        default: 'CURRENT_TIMESTAMP(6)',
      }),
    );
  }
}
