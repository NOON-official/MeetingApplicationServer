import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchedAtToMatching1689921138491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching ADD COLUMN matchedAt timestamp(6) AFTER createdAt;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching DROP COLUMN matchedAt;`);
  }
}
