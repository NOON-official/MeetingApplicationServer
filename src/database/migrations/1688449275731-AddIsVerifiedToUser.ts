import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerifiedToUser1688449275731 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN university int AFTER ageRange;`);
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN birth int AFTER university;`);
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN refusedUserIds json AFTER refreshToken;`);
    await queryRunner.query(`ALTER TABLE user ADD COLUMN isVerified boolean AFTER refusedUserIds;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user DROP COLUMN isVerified;`);
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN refusedUserIds json AFTER deletedAt;`);
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN birth int AFTER university;`);
    await queryRunner.query(`ALTER TABLE user MODIFY COLUMN university int AFTER refusedUserIds;`);
  }
}
