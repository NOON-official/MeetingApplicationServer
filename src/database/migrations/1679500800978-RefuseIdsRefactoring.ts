import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefuseIdsRefactoring1679500800978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user RENAME COLUMN refusedUserId TO refusedUserIds;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user RENAME COLUMN refusedUserIds TO refusedUserId;`);
  }
}
