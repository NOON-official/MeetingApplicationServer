import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserRefactoring1679472762686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user ADD COLUMN refusedUserId json AFTER refreshToken;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN refusedUserId;`);
  }
}
