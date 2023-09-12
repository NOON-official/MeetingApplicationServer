import { MigrationInterface, QueryRunner } from 'typeorm';

export class addExcludedTeamIdsToTeamTable1690367966158 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team ADD COLUMN excludedTeamIds json AFTER teamAvailableDate;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team DROP COLUMN excludedTeamIds;`);
  }
}
