import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteModifiedAtInTeamTable1690364137907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team DROP COLUMN modifiedAt;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team ADD COLUMN modifiedAt timestamp(6) AFTER updatedAt;`);
  }
}
