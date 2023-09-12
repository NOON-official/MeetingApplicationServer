import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsInMatching1688453215921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN maleTeamTicketId TO appliedTeamTicketId;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN femaleTeamTicketId TO receivedTeamTicketId;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN appliedTeamTicketId TO maleTeamTicketId;`);
    await queryRunner.query(`ALTER TABLE matching RENAME COLUMN receivedTeamTicketId TO femaleTeamTicketId;`);
  }
}
