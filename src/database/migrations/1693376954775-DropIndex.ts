import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class DropIndex1693376954775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('matching', 'FK_1c2652ddcaf6e65ba0e5355972a');
    await queryRunner.dropForeignKey('matching', 'FK_aff811b36d99a8a7de23b5a76b2');
    await queryRunner.query('DROP INDEX `REL_1c2652ddcaf6e65ba0e5355972` ON `matching`');
    await queryRunner.query('DROP INDEX `REL_aff811b36d99a8a7de23b5a76b` ON `matching`');

    await queryRunner.createForeignKey(
      'matching',
      new TableForeignKey({
        columnNames: ['appliedTeamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'team',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matching',
      new TableForeignKey({
        columnNames: ['receivedTeamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'team',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
