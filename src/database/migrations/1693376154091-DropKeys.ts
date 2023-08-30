import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropKeys1693376154091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('matching', 'FK_appliedTeamId_teamId');
    await queryRunner.dropForeignKey('matching', 'FK_receivedTeamId_teamId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
