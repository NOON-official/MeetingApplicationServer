import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameColumnsInMatching1688450281559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN maleTeamIsAccepted TO appliedTeamIsAccepted;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN femaleTeamIsAccepted TO receivedTeamIsAccepted;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN maleTeamId TO appliedTeamId;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN femaleTeamId TO receivedTeamId;`);
    await queryRunner.query(`ALTER TABLE matching DROP COLUMN chatCreatedAt;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN appliedTeamIsAccepted TO maleTeamIsAccepted;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN receivedTeamIsAccepted TO femaleTeamIsAccepted;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN appliedTeamId TO maleTeamId;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN receivedTeamId TO femaleTeamId;`);
    await queryRunner.query(`ALTER TABLE matching ADD COLUMN chatCreatedAt timestamp(6) AFTER femaleTeamId;`);
  }
}
