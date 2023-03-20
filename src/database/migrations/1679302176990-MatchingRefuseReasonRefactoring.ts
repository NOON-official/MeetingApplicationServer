import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchingRefuseReasonRefactoring1679302176990 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE matching_refuse_reason ADD COLUMN deletedAt timestamp(6) DEFAULT NULL AFTER createdAt;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching_refuse_reason DROP COLUMN deletedAt;`);
  }
}
