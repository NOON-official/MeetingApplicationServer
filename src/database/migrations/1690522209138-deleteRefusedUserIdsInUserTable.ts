import { MigrationInterface, QueryRunner } from 'typeorm';

export class deleteRefusedUserIdsInUserTable1690522209138 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN refusedUserIds;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user ADD COLUMN refusedUserIds json AFTER refreshToken;`);
  }
}
