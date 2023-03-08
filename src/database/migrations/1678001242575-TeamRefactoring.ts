import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamRefactoring1678001242575 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team ADD COLUMN modifiedAt timestamp(6) AFTER updatedAt;`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE team DROP COLUMN modifiedAt;`);
  }
}
